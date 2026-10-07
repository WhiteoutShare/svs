
そこにいた話せそうなサボテン🌵にも確認したが、返ってくる返事は「ジョーーーイ」のみ。先代スミスを見つけるにはまだまだ時間がかかりそうだ。

次回「先代スミスを探せ③」

## 評価

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ヒゲ物語、絶賛更新中！</title>
  <link rel="stylesheet" href="./css/highreview.css">
  <script src="./js/highreview.js"></script>
</head>

  <body>
    <div class="container">
      <a href="https://whiteoutshare.github.io/svs/post/highsan" style="font-weight: bold;">ホームページへ戻る</a>
      <br />
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
      <div>
       <a href="https://whiteoutshare.github.io/svs/post/highsan" style="font-weight: bold;">ホームページへ戻る</a>
       <br />
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
     </body>
