// D-Day 계산 함수
function getDDay(deadline) {
  if (!deadline) return "";
  const today = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? `D-${diff}` : "마감";
}

// 중앙 콘텐츠 렌더링 (제목, 내용만)
function renderPosts(posts, targetId) {
  const area = document.getElementById(targetId);
  area.innerHTML = '';

  // targetId별로 사용할 클래스명 정의
  const classMap = {
    'contentArea-club': 'club-box',        // 동아리용
    'contentArea-group': 'group-box',      // 소모임용
    'contentArea-etc': 'etc-box',          // 기타용
    'contentArea-bookmarked': 'bookmark-box' // 북마크용
  };

  const boxClass = classMap[targetId] || 'club-box'; // 기본 club-box

  const sorted = posts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  sorted.forEach(post => {
    const box = document.createElement('div');
    box.className = `contentbox ${boxClass}`; // 동적으로 클래스 지정
    box.innerHTML = `
      <div class="club_name">${post.title}</div>
      <div class="club_exp">${post.content.length > 50 ? post.content.slice(0, 50) + "..." : post.content}</div>
    `;
    area.appendChild(box);
  });
}

// 왼쪽 사이드바 렌더링 (디데이 + 제목만)
function renderSidebarPosts(posts, targetId) {
  const area = document.getElementById(targetId);
  area.innerHTML = '';

  const sorted = posts
    .filter(p => p.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  sorted.forEach(post => {
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.innerHTML = `
      <div class="d-day">${getDDay(post.deadline)}</div>
      <div class="club_name">${post.title}</div>
    `;
    area.appendChild(item);
  });
}

// 각 데이터 fetch 및 렌더링
fetch("/club/data/club_post")
  .then(res => res.json())
  .then(data => {
    renderPosts(data, "contentArea-club");
    renderSidebarPosts(data, "contentArea-populared"); // 왼쪽 인기 동아리
  })
  .catch(err => console.error("동아리 불러오기 오류:", err));

fetch("/club/data/smclub_post")
  .then(res => res.json())
  .then(data => renderPosts(data, "contentArea-group"))
  .catch(err => console.error("소모임 불러오기 오류:", err));

fetch("/club/data/etcclub_post")
  .then(res => res.json())
  .then(data => renderPosts(data, "contentArea-etc"))
  .catch(err => console.error("기타 불러오기 오류:", err));

// 사용자 별 북마크한 글 불러오기
const studentId = localStorage.getItem('loggedInUser');

if (studentId) {
  fetch(`/club/data/bookmarked_club_post?studentId=${studentId}`)
    .then(res => res.json())
    .then(data => renderPosts(data, "contentArea-bookmarked"))
    .catch(err => console.error("북마크 동아리 불러오기 오류:", err));
} else {
  console.warn("로그인한 유저가 없어 북마크를 불러올 수 없습니다.");
}
