<head>
  <link rel="stylesheet" href="./css/highsan.css">
  <script src="./js/backtotop.js"></script>
  <script src="./js/parsecsv.js"></script>
</head>

## [ホームページ](https://whiteoutshare.github.io/svs/post/highsan)

# 🔥 ヒゲ物語
## ヒゲモノ エピソード2
## 📖 目次
<ul id="toc"></ul>
<main id="stories"></main>

  <script>

    // 目次用アンカーIDを生成
    function createId(title, index) {
      return "story-" + index;
    }

    async function loadStories() {
      const response = await fetch("./csv/highsan2.csv?v=${Date.now()}");

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
          next.textContent = story.next;
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
