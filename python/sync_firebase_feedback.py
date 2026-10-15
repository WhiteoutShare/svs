import csv
import json
import os
import urllib.request
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

ROOT_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT_DIR / "post/csv/highsan3.csv"
IMAGE_DIR = ROOT_DIR / "post/i"
PROJECT_ID = os.environ.get(
    "PROJECT_ID",
    "whiteout-svs-highsan-backend"
)

JST = ZoneInfo("Asia/Tokyo")
MAX_IMAGE_SIZE = 20 * 1024 * 1024


def get_string(fields, name, default=""):
    value = fields.get(name, {})
    return value.get("stringValue", default)


def fetch_latest_feedback():
    url = (
        f"https://firestore.googleapis.com/v1/projects/"
        f"{PROJECT_ID}/databases/(default)/documents:runQuery"
    )

    payload = {
        "structuredQuery": {
            "from": [{"collectionId": "feedback"}],
            "orderBy": [{
                "field": {"fieldPath": "createdAt"},
                "direction": "DESCENDING"
            }],
            "limit": 1
        }
    }

    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        result = json.loads(response.read().decode("utf-8"))

    documents = [
        item["document"]
        for item in result
        if "document" in item
    ]

    if not documents:
        raise RuntimeError("Firebase 中没有 feedback 数据")

    document = documents[0]
    return document.get("name", ""), document.get("fields", {})


def get_timestamp(fields):
    created_at = get_string(fields, "createdAt")

    if created_at:
        try:
            timestamp = datetime.fromisoformat(
                created_at.replace("Z", "+00:00")
            )
            if timestamp.tzinfo is None:
                timestamp = timestamp.replace(tzinfo=JST)
            return timestamp.astimezone(JST)
        except ValueError:
            pass

    return datetime.now(JST)


def save_image(image_url, timestamp):
    if not image_url:
        return ""

    parsed = urlparse(image_url)

    if parsed.scheme != "https" or not parsed.hostname:
        raise RuntimeError("图片 URL 必须是有效的 HTTPS 地址")

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    suffix = Path(parsed.path).suffix.lower()
    allowed = {
        ".jpg", ".jpeg", ".png", ".gif",
        ".webp", ".avif", ".svg", ".bmp"
    }

    if suffix not in allowed:
        suffix = ".jpg"

    base_name = timestamp.strftime("%Y%m%d%H%M%S")
    image_path = IMAGE_DIR / f"{base_name}{suffix}"

    counter = 1
    while image_path.exists():
        image_path = IMAGE_DIR / f"{base_name}_{counter}{suffix}"
        counter += 1

    request = urllib.request.Request(
        image_url,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    with urllib.request.urlopen(request, timeout=60) as response:
        content_type = response.headers.get(
            "Content-Type", ""
        ).split(";")[0].strip().lower()

        if not content_type.startswith("image/"):
            raise RuntimeError(
                f"URL 返回的不是图片: {content_type}"
            )

        data = response.read(MAX_IMAGE_SIZE + 1)

    if not data:
        raise RuntimeError("下载的图片为空")

    if len(data) > MAX_IMAGE_SIZE:
        raise RuntimeError("图片超过 20 MB")

    with image_path.open("xb") as file:
        file.write(data)

    # CSV 不包含 post/ 前缀
    relative_path = image_path.relative_to(ROOT_DIR / "post")
    csv_image_path = relative_path.as_posix()

    print(f"图片已保存: {image_path}")
    print(f"CSV 图片路径: {csv_image_path}")

    return csv_image_path


def append_csv(row):
    if not CSV_PATH.exists():
        raise FileNotFoundError(CSV_PATH)

    expected = ["title", "image", "alt", "content", "next"]

    with CSV_PATH.open(
        "r", encoding="utf-8-sig", newline=""
    ) as file:
        reader = csv.DictReader(file)

        if reader.fieldnames != expected:
            raise RuntimeError(
                f"CSV 表头不匹配: {reader.fieldnames}"
            )

        existing_rows = list(reader)

    if existing_rows:
        last = existing_rows[-1]

        # 同时比较 title、image、content、next，避免漏掉 Next 字段变化
        if (
            last.get("title", "") == row[0]
            and last.get("image", "") == row[1]
            and last.get("content", "") == row[3]
            and last.get("next", "") == row[4]
        ):
            print("最新数据已经保存到 CSV")
            return False

    # 确保文件以换行符结尾
    with CSV_PATH.open("rb+") as file:
        file.seek(0, os.SEEK_END)
        size = file.tell()

        if size:
            file.seek(-1, os.SEEK_END)
            if file.read(1) not in (b"\n", b"\r"):
                file.seek(0, os.SEEK_END)
                file.write(b"\n")

    with CSV_PATH.open(
        "a", encoding="utf-8", newline=""
    ) as file:
        writer = csv.writer(file, lineterminator="\n")
        writer.writerow(row)

    print(f"已追加 CSV: {CSV_PATH}")
    return True


def main():
    document_name, fields = fetch_latest_feedback()

    title = get_string(fields, "title", "最新の投稿")
    next_value = get_string(fields, "next")
    message = get_string(fields, "message")
    image_url = get_string(fields, "imageUrl")
    timestamp = get_timestamp(fields)

    if not title and not next_value and not message and not image_url:
        raise RuntimeError("最新记录没有投稿内容")

    # 使用 Firestore 文档 ID 作为稳定的去重依据（当前 CSV 没有 ID 列）
    document_id = document_name.rsplit("/", 1)[-1]

    if not document_id:
        raise RuntimeError("无法获取 Firestore 文档 ID")

    local_image = save_image(image_url, timestamp)

    # CSV 列顺序：title, image, alt, content, next
    row = [
        title,
        local_image,
        "",
        message,
        next_value
    ]

    append_csv(row)


if __name__ == "__main__":
    main()
