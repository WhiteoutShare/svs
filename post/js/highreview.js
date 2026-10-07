import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
        getFirestore,
        collection,
        addDoc,
        getDocs,
        query,
        orderBy,
        limit,
        startAfter,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
      const firebaseConfig = {
        apiKey: "AIzaSyD2rzzurBFr8lRThlam8_UyJ4jjTy03Nvk",
        authDomain: "whiteout-svs-highsan.firebaseapp.com",
        projectId: "whiteout-svs-highsan",
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      // =========================
      // 配置
      // =========================

      const PAGE_SIZE = 10;

      let currentPage = 1;
      let loading = false;
      let hasNextPage = false;

      // 已读取页面缓存
      const pageCache = {};

      // 每页最后一条，用于下一页查询
      const pageCursors = {};

      // =========================
      // DOM
      // =========================

      const msgBox = document.getElementById("msg");

      const counter = document.getElementById("counter");

      const sendBtn = document.getElementById("sendBtn");

      const tbody = document.getElementById("messageTable");

      const prevBtn = document.getElementById("prevBtn");

      const nextBtn = document.getElementById("nextBtn");

      const pageInfo = document.getElementById("pageInfo");

      // =========================
      // 发布消息
      // =========================

      window.saveMessage = async function () {
        const msg = msgBox.value.trim();

        if (!msg) {
          alert("メッセージを入力してください。");
          return;
        }

        if (msg.length > 500) {
          alert("500文字以内で入力してください。");
          return;
        }

        try {
          sendBtn.disabled = true;

          await addDoc(collection(db, "feedback"), {
            message: msg,
            createdAt: new Date().toISOString(),
          });

          msgBox.value = "";
          counter.textContent = "0/500";

          // 新数据产生后清除分页缓存
          clearPagination();

          await loadPage(1);
        } catch (e) {
          console.error(e);

          alert("投稿に失敗しました。");
        } finally {
          sendBtn.disabled = false;
        }
      };

      // =========================
      // 清除分页缓存
      // =========================

      function clearPagination() {
        Object.keys(pageCache).forEach((key) => delete pageCache[key]);

        Object.keys(pageCursors).forEach((key) => delete pageCursors[key]);

        currentPage = 1;
        hasNextPage = false;
      }

      // =========================
      // 加载页面
      // =========================

      async function loadPage(page) {
        if (loading) {
          return;
        }

        loading = true;

        prevBtn.disabled = true;
        nextBtn.disabled = true;

        try {
          // =======================
          // 优先使用缓存
          // =======================

          if (pageCache[page]) {
            renderPage(page, pageCache[page]);

            loading = false;

            return;
          }

          // =======================
          // Firestore 查询
          // =======================

          let q;

          const collectionRef = collection(db, "feedback");

          if (page === 1) {
            q = query(
              collectionRef,
              orderBy("createdAt", "desc"),
              limit(PAGE_SIZE),
            );
          } else {
            const lastDoc = pageCursors[page - 1];

            if (!lastDoc) {
              throw new Error("分页游标不存在");
            }

            q = query(
              collectionRef,
              orderBy("createdAt", "desc"),
              startAfter(lastDoc),
              limit(PAGE_SIZE),
            );
          }

          showLoading();

          const snapshot = await getDocs(q);

          const docs = snapshot.docs;

          // 保存页面数据
          pageCache[page] = docs;

          // 保存分页游标
          if (docs.length > 0) {
            pageCursors[page] = docs[docs.length - 1];
          }

          renderPage(page, docs);
        } catch (e) {
          console.error(e);

          tbody.innerHTML = `
            <tr>
              <td colspan="3" class="center">
                データ取得エラー
              </td>
            </tr>
          `;

          nextBtn.disabled = true;
        } finally {
          loading = false;
        }
      }

      // =========================
      // 显示页面
      // =========================

      function renderPage(page, docs) {
        tbody.innerHTML = "";

        if (docs.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="3" class="center">
                投稿はまだありません。
              </td>
            </tr>
          `;

          hasNextPage = false;

          currentPage = page;

          pageInfo.textContent = `第 ${page} 页`;

          prevBtn.disabled = page <= 1;

          nextBtn.disabled = true;

          return;
        }

        docs.forEach((doc, index) => {
          const data = doc.data();

          const date = data.createdAt
            ? new Date(data.createdAt).toLocaleString("ja-JP")
            : "";

          const tr = document.createElement("tr");

          const noTd = document.createElement("td");

          noTd.className = "center";

          noTd.textContent = (page - 1) * PAGE_SIZE + index + 1;

          const msgTd = document.createElement("td");

          msgTd.className = "msg-col";

          msgTd.textContent = data.message ?? "";

          const dateTd = document.createElement("td");

          dateTd.className = "center";

          dateTd.textContent = date;

          tr.appendChild(noTd);
          tr.appendChild(msgTd);
          tr.appendChild(dateTd);

          tbody.appendChild(tr);
        });

        currentPage = page;

        pageInfo.textContent = `第 ${page} 页`;

        prevBtn.disabled = page <= 1;

        /*
         * 每页严格只读取 PAGE_SIZE。
         * 因此无法提前知道下一页是否存在。
         */
        hasNextPage = docs.length === PAGE_SIZE;

        nextBtn.disabled = !hasNextPage;
      }

      // =========================
      // Loading
      // =========================

      function showLoading() {
        tbody.innerHTML = `
          <tr>
            <td colspan="3" class="loading">
              読み込み中...
            </td>
          </tr>
        `;
      }

      // =========================
      // 下一页
      // =========================

      window.nextPage = async function () {
        if (loading || !hasNextPage) {
          return;
        }

        await loadPage(currentPage + 1);
      };

      // =========================
      // 上一页
      // =========================

      window.prevPage = async function () {
        if (loading || currentPage <= 1) {
          return;
        }

        await loadPage(currentPage - 1);
      };

      // =========================
      // 字数统计
      // =========================

      msgBox.addEventListener("input", () => {
        const length = msgBox.value.length;

        counter.textContent = `${length}/500`;

        if (length > 500) {
          counter.style.color = "red";

          sendBtn.disabled = true;
        } else {
          counter.style.color = "#666";

          sendBtn.disabled = false;
        }
      });

      // =========================
      // 初始化
      // =========================

      loadPage(1);
});
