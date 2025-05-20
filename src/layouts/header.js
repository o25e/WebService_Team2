window.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.createElement("div");

  fetch("../layouts/Header.html")
    .then((res) => res.text())
    .then((html) => {
      headerContainer.innerHTML = html;
      document.body.insertBefore(headerContainer, document.body.firstChild);

      // ✅ 헤더가 DOM에 삽입된 후 로그인 상태 확인 및 업데이트
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
    })
    .catch((err) => console.error("헤더 로드 실패:", err));
});

// ✅ 로그아웃 함수 전역 등록
function logout() {
  localStorage.removeItem("loggedInUser");
  alert("로그아웃 되었습니다.");
  window.location.href = "../pages/main.html"; // 필요시 main.html 경로 수정
}
