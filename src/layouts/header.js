window.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.createElement("div");

  fetch("../layouts/Header.html")
    .then((res) => res.text())
    .then((html) => {
      headerContainer.innerHTML = html;
      document.body.insertBefore(headerContainer, document.body.firstChild);
    })
    .catch((err) => console.error("헤더 로드 실패:", err));
});
