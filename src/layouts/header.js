window.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.createElement("div");

  fetch("./layouts/Header.html")
    .then((res) => res.text())
    .then((html) => {
      headerContainer.innerHTML = html;
      document.body.insertBefore(headerContainer, document.body.firstChild);

      // ✅ 로그인 상태 처리
      const loggedInUser = localStorage.getItem("loggedInUser");
      const authArea = headerContainer.querySelector("#auth-area");

      if (authArea) {
        if (loggedInUser) {
          authArea.innerHTML = `
            <span style="margin-right: 10px;">👤 <strong>${loggedInUser}</strong> 님</span>
            <button onclick="logout()" class="login-button" style="background-color: #ccc; color: #000;">로그아웃</button>
          `;
        } else {
          authArea.innerHTML = `
            <a href="../pages/login.html" class="login-button">로그인</a>
          `;
        }
      }

      // ✅ 현재 페이지에 따라 nav-link active 클래스 처리
      const currentPage = window.location.pathname.split("/").pop(); // 예: main.html
      const navLinks = headerContainer.querySelectorAll(".nav-link");

      navLinks.forEach((link) => {
        const linkHref = link.getAttribute("href").split("/").pop();
        if (linkHref === currentPage) {
          link.classList.add("active");
        }
      });
    })
    .catch((err) => console.error("헤더 로드 실패:", err));
});

// ✅ 로그아웃 함수 전역 등록
function logout() {
  localStorage.removeItem("loggedInUser");
  alert("로그아웃 되었습니다.");
  window.location.href = "../pages/main.html"; // 경로 필요 시 수정
}
