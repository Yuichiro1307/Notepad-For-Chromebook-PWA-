const memo = document.getElementById("memo");
const fontSelect = document.getElementById("fontSelect");
const closeBtn = document.getElementById("closeBtn");
const openBtn = document.getElementById("openBtn");
const maxBtn = document.getElementById("maxBtn");
const fileInput = document.getElementById("fileInput");

let db;

/* -----------------------
   IndexedDB 初期化
----------------------- */
const request = indexedDB.open("notepadDB", 1);

request.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore("memos", {
    keyPath: "id",
    autoIncrement: true
  });
};

request.onsuccess = e => {
  db = e.target.result;
};

/* -----------------------
   起動時復元
----------------------- */
memo.value = localStorage.getItem("memoText") || "";
fontSelect.value = localStorage.getItem("font") || "MS Gothic";
memo.style.fontFamily = fontSelect.value;

/* -----------------------
   自動保存
----------------------- */
memo.addEventListener("input", () => {
  localStorage.setItem("memoText", memo.value);
});

/* -----------------------
   フォント変更
----------------------- */
fontSelect.addEventListener("change", () => {
  memo.style.fontFamily = fontSelect.value;
  localStorage.setItem("font", fontSelect.value);
});

/* -----------------------
   ファイルを開く（－ボタン）
----------------------- */
openBtn.addEventListener("click", () => {
  fileInput.value = "";
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    memo.value = e.target.result;
    localStorage.setItem("memoText", memo.value);
  };
  reader.readAsText(file);
});

/* -----------------------
   最大化（全画面）
----------------------- */
maxBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

/* -----------------------
   IndexedDB 保存
----------------------- */
function saveToIndexedDB() {
  if (!memo.value.trim() || !db) return;

  const tx = db.transaction("memos", "readwrite");
  tx.objectStore("memos").add({
    text: memo.value,
    font: fontSelect.value,
    created: new Date()
  });
}

/* -----------------------
   ×ボタン処理
----------------------- */
closeBtn.addEventListener("click", () => {

  // txt保存
  const blob = new Blob([memo.value], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "memo.txt";
  a.click();

  // IndexedDB保存
  saveToIndexedDB();

  // 再起動
  localStorage.removeItem("memoText");
  memo.value = "";
});
