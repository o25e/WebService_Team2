// D-Day 계산 함수
function getDDay(deadline) {
  if (!deadline) return "";
  const today = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? `D-${diff}` : "마감";
}

// 중앙 콘텐츠 렌더링 (제목, 내용만, 마감된 글 제외)
function renderPosts(posts, targetId, typePath) {
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
    const rawHtml = post.content; // 글 내용 가져오기
    const plainText = rawHtml.replace(/<[^>]*>?/gm, ''); // 모든 HTML 태그 제거
    const length = plainText.trim().length; // 텍스트 길이

    const box = document.createElement('div');
    box.className = `contentbox ${boxClass}`;
    box.innerHTML = `
      <div class="club_name">${post.title}</div>
      <div class="club_exp">${length > 50 ? plainText.slice(0, 47) + "..." : post.content}</div>
    `;
    box.addEventListener("click", () => {
      window.location.href = `/content/${post._id}?type=${typePath}`;
    });
    area.appendChild(box);
  });
}

// 왼쪽 사이드바 렌더링 (디데이 + 제목만, 마감된 글 제외)
function renderSidebarPosts(posts, targetId, typePath) {
  const area = document.getElementById(targetId);
  area.innerHTML = '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = posts
    .filter(p => {
      if (!p.deadline) return false; // 마감일 없는 글 제외
      const deadlineDate = new Date(p.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate >= today;
    })
    .sort((a, b) => {
      const deadlineA = new Date(a.deadline).setHours(0, 0, 0, 0);
      const deadlineB = new Date(b.deadline).setHours(0, 0, 0, 0);

      if (deadlineA !== deadlineB) {
        return deadlineA - deadlineB; // 마감일이 빠른 순
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt); // 동일한 마감일이면 최신 등록 순
      }
    })
    .slice(0, 3);

  sorted.forEach(post => {
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.innerHTML = `
      <div class="d-day">${getDDay(post.deadline)}</div>
      <div class="club_name">${post.title}</div>
    `;
    item.addEventListener('click', () => {
      window.location.href = `/content/${post._id}?type=${post.postType}`; 
    });
    area.appendChild(item);
  });
}

function renderSidebarBookmark(posts, targetId, typePath) {
  const area = document.getElementById(targetId);
  area.innerHTML = '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = posts
    .filter(p => {
      if (!p.deadline) return false; // 마감일 없는 글 제외
      const deadlineDate = new Date(p.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      return deadlineDate >= today;
    })
    .sort((a, b) => {
      const deadlineA = new Date(a.deadline).setHours(0, 0, 0, 0);
      const deadlineB = new Date(b.deadline).setHours(0, 0, 0, 0);

      if (deadlineA !== deadlineB) {
        return deadlineA - deadlineB; // 마감일이 빠른 순
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt); // 동일한 마감일이면 최신 등록 순
      }
    })
    .slice(0, 3);

  sorted.forEach(post => {
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.innerHTML = `
      <div class="d-day">${getDDay(post.deadline)}</div>
      <div class="club_name">${post.title}</div>
    `;
    item.addEventListener('click', () => {
      let typePath = post.category || 'club';
      window.location.href = `/content/${post._id}?type=${typePath}`;
    });
    area.appendChild(item);
  });
}

// 각 데이터 fetch 및 렌더링
Promise.all([
  fetch("/club/data/club_post").then(res => res.json()),
  fetch("/club/data/smclub_post").then(res => res.json()),
  fetch("/club/data/etcclub_post").then(res => res.json())
]).then(([clubData, smclubData, etcclubData]) => {
  // 중앙 콘텐츠 개별 렌더링
  renderPosts(clubData, "contentArea-club", "club");
  renderPosts(smclubData, "contentArea-group", "smclub");
  renderPosts(etcclubData, "contentArea-etc", "etcclub");

  // ✅ postType 붙여서 통합 후 마감 임박 사이드바 렌더링
  const allPosts = [
    ...clubData.map(p => ({ ...p, postType: "club" })),
    ...smclubData.map(p => ({ ...p, postType: "smclub" })),
    ...etcclubData.map(p => ({ ...p, postType: "etcclub" }))
  ];
  renderSidebarPosts(allPosts, "contentArea-populared");
});
  
// 사용자 별 북마크한 글 불러오기
const studentId = localStorage.getItem('loggedInUser');

if (studentId) {
  fetch(`/club/data/bookmarked_club_post?studentId=${studentId}`)
    .then(res => res.json())
    .then(data => renderSidebarBookmark(data, "contentArea-bookmarked", "club"))
    .catch(err => console.error("북마크 동아리 불러오기 오류:", err));
} else {
  console.warn("로그인한 유저가 없어 북마크를 불러올 수 없습니다.");
}
