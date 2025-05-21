window.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.createElement("div");

  fetch("../layouts/Header.html")
    .then((res) => res.text())
    .then((html) => {
      headerContainer.innerHTML = html;
      document.body.insertBefore(headerContainer, document.body.firstChild);

      const loggedInUser = localStorage.getItem("loggedInUser");
      const unreadNotifications = 3;  // 실제 값은 서버나 localStorage 등에서 받아와야 함

      const authArea = headerContainer.querySelector("#auth-area");

      if (authArea) {
        if (loggedInUser) {
          authArea.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; position: relative;">
              <!-- 프로필 이미지 -->
              <img src="../assets/profile-icon.png" alt="프로필" style="width: 40px; height: 40px; border-radius: 50%;" />

              <!-- 알림 아이콘 + 배지 -->
              <div style="position: relative; cursor: pointer;" onclick="goToNotifications()" title="알림 확인">
                <img src="../assets/notification-icon.png" alt="알림" style="width: 60px; height: 54px;" />
                ${
                  unreadNotifications > 0
                    ? `<span style="
                        position: absolute;
                        top: 7px;
                        right: 4px;
                        background: red;
                        color: white;
                        font-size: 12px;
                        padding: 2px 6px;
                        border-radius: 12px;
                        font-weight: bold;
                        min-width: 20px;
                        text-align: center;
                        line-height: 1;
                        box-shadow: 0 0 2px rgba(0,0,0,0.3);
                      ">${unreadNotifications}</span>`
                    : ''
                }
              </div>

              <!-- 유저 이름 및 로그아웃 -->
              <div style="display: flex; flex-direction: column; align-items: flex-start;">
                <span style="margin-bottom: 5px;"><strong>${loggedInUser}</strong> 님</span>
                <button onclick="logout()" class="login-button" style="background-color: #e93535; color: #fff; padding: 4px 8px; font-size: 16px;">로그아웃</button>
              </div>
            </div>
          `;
        } else {
          authArea.innerHTML = `
            <a href="/login" class="login-button">로그인</a>
          `;
        }
      }

      // 활성 링크 표시
      const currentPage = window.location.pathname.split("/").pop();
      const navLinks = headerContainer.querySelectorAll(".nav-link");

      navLinks.forEach((link) => {
        const linkHref = link.getAttribute("href")?.split("/").pop();
        if (linkHref === currentPage) {
          link.classList.add("active");
        }
      });
    })
    .catch((err) => console.error("헤더 로드 실패:", err));
});

function logout() {
  localStorage.removeItem("loggedInUser");
  alert("로그아웃 되었습니다.");
  window.location.href = "/main";
}

function goToNotifications() {
  window.location.href = "/notifications";
}
