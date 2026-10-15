<head>
  <link rel="stylesheet" href="./css/highsan.css">
  <script src="./js/backtotop.js"></script>
  <script src="./js/parsecsv.js"></script>
</head>

## [ホームページ](https://whiteoutshare.github.io/svs/post/highsan)

# 🔥 ヒゲ物語
## ヒゲモノ エピソード3
## 📖 目次
<ul id="toc"></ul>
<main id="stories"></main>

  <script>

    loadStories('./csv/highsan4.csv').catch(error => {
      console.error(error);
      document.getElementById("stories").textContent =
        "ストーリーの読み込みに失敗しました。CSVのパスを確認してください。";
    });
  </script>

## [ホームページ](https://whiteoutshare.github.io/svs/post/highsan)
## [感想,評価](https://whiteoutshare.github.io/svs/post/highsan#感想評価)
<button id="backToTop" title="ページ上部へ">↑</button>
