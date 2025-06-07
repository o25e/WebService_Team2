// D-Day 계산 함수
function getDDay(deadline) {
  if (!deadline) return "";
  const today = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? `D-${diff}` : "마감";
}

// 중앙 콘텐츠 렌더링 (제목, 내용만, 마감된 글 제외)
function renderPosts(posts, targetId) {
  const area = document.getElementById(targetId);
  area.innerHTML = '';

  // targetId별로 사용할 클래스명 정의
  const classMap = {
    'contentArea-club': 'club-box',
    'contentArea-group': 'group-box',
    'contentArea-etc': 'etc-box',
    'contentArea-bookmarked': 'bookmark-box'
  };

  const boxClass = classMap[targetId] || 'club-box';

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 날짜 비교용

  const sorted = posts
    .filter(p => {
      if (!p.deadline) return true; // 마감일 없으면 포함
      const deadlineDate = new Date(p.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate >= today;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 최신 글 우선
    .slice(0, 3);

  sorted.forEach(post => {
    const box = document.createElement('div');
    box.className = `contentbox ${boxClass}`;
    box.innerHTML = `
      <div class="club_name">${post.title}</div>
      <div class="club_exp">${post.content.length > 50 ? post.content.slice(0, 50) + "..." : post.content}</div>
    `;
    area.appendChild(box);
  });
}

// 왼쪽 사이드바 렌더링 (디데이 + 제목만, 마감된 글 제외)
function renderSidebarPosts(posts, targetId) {
  const area = document.getElementById(targetId);
  area.innerHTML = '';

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 제거로 정확한 날짜 비교

  const sorted = posts
    .filter(p => p.deadline) // 마감일 있는 글만
    .map(p => ({ ...p, deadlineDate: new Date(p.deadline) }))
    .filter(p => p.deadlineDate >= today) // 오늘 이후만
    .sort((a, b) => a.deadlineDate - b.deadlineDate) // 마감일 빠른 순
    .slice(0, 3); // 최대 3개

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
    .then(data => renderSidebarPosts(data, "contentArea-bookmarked"))
    .catch(err => console.error("북마크 동아리 불러오기 오류:", err));
} else {
  console.warn("로그인한 유저가 없어 북마크를 불러올 수 없습니다.");
}
