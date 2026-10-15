<head>
  <link rel="stylesheet" href="./css/highsan.css">
  <script src="./js/backtotop.js"></script>
</head>

## [ホームページ](https://whiteoutshare.github.io/svs/post/highsan)

# 🔥 ヒゲ物語
## ヒゲモノ エピソード3
## 📖 目次
<ul id="toc"></ul>
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

    // 目次用アンカーIDを生成
    function createId(title, index) {
      return "story-" + index;
    }

    async function loadStories() {
      const response = await fetch("./csv/storie1.csv");

      if (!response.ok) {
        throw new Error("CSVを読み込めませんでした");
      }

      const csvText = await response.text();
      const stories = parseCSV(csvText);

      const toc = document.getElementById("toc");
      const container = document.getElementById("stories");

      stories.forEach((story, index) => {
        const id = createId(story.title, index);

        // 目次
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#" + id;
        link.textContent = story.title;
        li.appendChild(link);
        toc.appendChild(li);

        // セクション
        const section = document.createElement("section");
        section.id = id;

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

        const next = document.createElement("p");

        if (story.next) {
          next.textContent = "次回「" + story.next + "」";
        } else {
          next.textContent = "エピソード2完結";
        }

        contentBox.appendChild(next);

        item.appendChild(imageBox);
        item.appendChild(contentBox);
        section.appendChild(item);
        container.appendChild(section);
      });
    }

    loadStories().catch(error => {
      console.error(error);
      document.getElementById("stories").textContent =
        "ストーリーの読み込みに失敗しました。CSVのパスを確認してください。";
    });
  </script>

## [ホームページ](https://whiteoutshare.github.io/svs/post/highsan)
## [感想,評価](https://whiteoutshare.github.io/svs/post/highsan#感想評価)
<button id="backToTop" title="ページ上部へ">↑</button>
