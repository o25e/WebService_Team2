window.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.createElement("div"); // 헤더 div 만들기
  const titleTag = document.querySelector("head > title"); // title 태그 찾기
  // title 태그 바로 다음에 favicon 삽입
  titleTag.insertAdjacentHTML(
    "afterend",
    `<!-- 파비콘 -->
     <link rel="icon" type="image/" href="https://cdn.builder.io/api/v1/image/assets/TEMP/5e00ff58ae24d3b693ab7c42a265da829f20a895">`
  );

  fetch("/layouts/Header.html")
    .then((res) => res.text())
    .then((html) => {
      headerContainer.innerHTML = html;
      document.body.insertBefore(headerContainer, document.body.firstChild);

      const studentId = localStorage.getItem("loggedInUser");

      // 알림 수 불러오기
      fetch(`/api/unread-count?studentId=${studentId}`)
        .then(res => res.json())
        .then(data => {
          const unreadNotifications = data.count;

          const authArea = headerContainer.querySelector("#auth-area");

          if (authArea) {
            if (studentId) {
              authArea.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; position: relative;">
                  <img src="../assets/profile-icon.png" alt="프로필" style="width: 40px; height: 40px; border-radius: 50%;" />

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

                  <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    <a href="/mypage" style="margin-bottom: 5px; text-decoration: none; color: inherit; font-weight: bold; cursor: pointer;">
                      ${studentId} 님
                    </a>
                    <button onclick="logout()" class="login-button" style="background-color: #e93535; color: #fff; padding: 4px 8px; font-size: 16px;">로그아웃</button>
                  </div>
                </div>
              `;
            } else {
              authArea.innerHTML = `<a href="/login" class="login-button">로그인</a>`;
            }
          }

          // 현재 페이지 표시
          const currentPage = window.location.href.split("/").pop();
          const navLinks = headerContainer.querySelectorAll(".nav-link");

          navLinks.forEach((link) => {
            const linkHref = link.getAttribute("href") ?? '';
            if (linkHref === "/" + currentPage) {
              link.classList.add("active");
            }
          });
        });
    })
    .catch((err) => console.error("헤더 로드 실패:", err));
});

function logout() {
  localStorage.removeItem("loggedInUser");
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("loggedIn");
  alert("로그아웃 되었습니다.");
  window.location.href = "/home";
}

function goToNotifications() {
  window.location.href = "/notifications";
}
