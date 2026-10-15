
<main id="stories"></main>

<script>
      // CSVを解析する。引用符内のカンマにも対応。
    function parseCSV(text) {
      const rows = [];
      let row = [];
      let field = "";
      let quoted = false;

      text = text.replace(/^\uFEFF/, "");

      for (let i = 0; i < text.length; i++) {
        const c = text[i];

        if (quoted) {
          if (c === '"' && text[i + 1] === '"') {
            field += '"';
            i++;
          } else if (c === '"') {
            quoted = false;
          } else {
            field += c;
          }
        } else if (c === '"' && field === "") {
          quoted = true;
        } else if (c === ",") {
          row.push(field);
          field = "";
        } else if (c === "\n") {
          row.push(field);
          rows.push(row);
          row = [];
          field = "";
        } else if (c !== "\r") {
          field += c;
        }
      }

      if (field !== "" || row.length > 0) {
        row.push(field);
        rows.push(row);
      }

      const headers = rows.shift();

      return rows
        .filter(r => r.some(v => v.trim() !== ""))
        .map(r => {
          const item = {};
          headers.forEach((header, i) => {
            item[header.trim()] = (r[i] || "").trim();
          });
          return item;
        });
    }
  
  async function loadStories() {
    const response = await fetch(`./csv/highsan3.csv?v=${Date.now()}`);

    if (!response.ok) {
      throw new Error("CSVを読み込めませんでした");
    }

    const csvText = await response.text();
    const stories = parseCSV(csvText);

    const container = document.getElementById("stories");

    // CSVの最後の1件だけ取得
    if (stories.length === 0) {
      container.textContent = "ストーリーがありません。";
      return;
    }

    const story = stories[stories.length - 1];

    // セクション
    const section = document.createElement("section");

    const heading = document.createElement("h2");
    heading.textContent = story.title;
    section.appendChild(heading);

    // blog-item
    const item = document.createElement("div");
    item.className = "blog-item";

    const imageBox = document.createElement("div");
    imageBox.className = "blog-image";

    const img = document.createElement("img");
    img.src = story.image;
    img.alt = story.alt || story.title;

    imageBox.appendChild(img);

    const contentBox = document.createElement("div");
    contentBox.className = "blog-content";

    const description = document.createElement("p");
    description.textContent = story.content;
    contentBox.appendChild(description);

    if (story.next) {
      const next = document.createElement("p");
      next.textContent = story.next;
      contentBox.appendChild(next);
    }

    item.appendChild(imageBox);
    item.appendChild(contentBox);
    section.appendChild(item);

    container.appendChild(section);
  }

  loadStories().catch(error => {
    console.error(error);
    document.getElementById("stories").textContent =
      "ストーリーの読み込みに失敗しました。CSVのパスを確認してください。";
  });
</script>


## 評価

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ヒゲ物語、絶賛更新中！</title>
  <link rel="stylesheet" href="./css/highreview.css">
</head>

  <body>
    <div class="container">
      <h2>📋 ヒゲ物語、絶賛更新中！</h2>

      <textarea
        id="msg"
        maxlength="500"
        placeholder="メッセージを入力してください..."
      ></textarea>

      <div class="button-area">
        <button id="sendBtn" onclick="saveMessage()">送信</button>

        <span
          id="counter"
          style="margin-left: 15px; color: #666; font-size: 14px"
        >
          0/500
        </span>

        <span style="margin-left: 20px; color: #000; font-size: 14px; font-weight: bold;"> 
          ※無料サービスを利用しているため、当日に連続して投稿に失敗した場合は、翌日に改めて投稿をお試しください。
        </span>
      </div>
      <div class="table-wrapper">
        <div class="pagination">
          <button id="prevBtn" onclick="prevPage()">← 上一页</button>

          <span id="pageInfo" class="page-info"> 第 1 页 </span>

          <button id="nextBtn" onclick="nextPage()">下一页 →</button>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px">No</th>
              <th>メッセージ内容</th>
              <th class="date-col">投稿日時</th>
            </tr>
          </thead>

          <tbody id="messageTable">
            <tr>
              <td colspan="3" class="loading">読み込み中...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
      <script type="module" src="./js/highreview.js"></script>
     </body>
