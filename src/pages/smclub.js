//필터
function showFilter(type, element) {
    const menus = document.querySelectorAll('.menu');
    menus.forEach(menu => menu.classList.remove('active'));
    element.classList.add('active');

    const boxes = document.querySelectorAll('.filter-box');
    boxes.forEach(box => box.classList.remove('active'));

    const target = document.querySelector(`.${type}`);
    if (target) target.classList.add('active');
}
// 글 데이터 서버로부터 가져오기
let posts = [];
fetch("/smclub/data")
    .then(res => res.json())
    .then(data => {
        console.log(data);
        posts = data;
        renderPosts(posts);
    });

//글 임시로 보여주기
// const posts = [
//     {
//         "title": "공연 동아리",
//         "content": "춤추자.",
//         "category": "공연/댄스",
//         "deadline": "2025-05-20",
//         "image": "../assets/club.png"
//     }
//     ,
//     {
//         "title": "산악 동아리",
//         "content": "등산하자.",
//         "category": "여행/사진/산악",
//         "deadline": "2025-06-10",
//         "image": "../assets/club.png"
//     }
//     ,
//     {
//         "title": "국제 교류 동아리",
//         "content": "렛츠교류.",
//         "category": "국제/교류",
//         "deadline": "2025-05-30",
//         "image": "../assets/club.png"
//     }
//     ,

// ];

//posts에서 쓴 deadline dday로 보여주기기
function getDDay(deadline) {
    const today = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `D-${diff}` : `마감`;
}

//dday value값 반환
function getStatus(deadline) {
    const today = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? "ing" : "done";
}


//posts 글 contentbox 맞춰서 보여주기
function renderPosts(data) {

    const area = document.getElementById('contentArea');
    area.innerHTML = '';

    data.forEach(post => {
        const box = document.createElement('div');
        box.className = 'contentbox';
        box.innerHTML = `
        <!-- 소모임 카드 -->
        <div class="card">
            <!-- 이미지와 정보 묶음 -->
            <div class="card-content">
                <!-- 이미지와 상태 -->
                <div class="image-wrapper">
                    ${post.image ? `<img src="${post.image}" alt="이미지" class="image">` : ''}
                    <div class="status-left">
                        ${getDDay(post.deadline)}
                    </div>
                </div>

                <!-- 소모임 정보 -->
                <div class="info">
                    <h2 class="title">${post.title}</h2>
                    <p class="description">${post.content.length > 100 ? post.content.slice(0, 100)+"..." : post.content}</p>

                    <div class="period-wrapper">
                        <div class="period">
                            <span class="period-label">모집 기간</span>
                            <span class="period-dates">2025.05.01 ~ 2025.05.11</span>
                        </div>
                    </div>

                    <!-- 해시태그들 -->
                    <div class="hashtags">
                        <span class="hashtag">#디자인</span>
                        <span class="hashtag">#화목</span>
                        <!-- 추가 해시태그 -->
                    </div>
                </div>
            </div>

            <!-- 최신 글 -->
            <div class="latest-posts">
                <h3 class="latest-title">최신 글</h3>
                <hr class="divider">

                <!-- 게시글 -->
                <div class="post-list">
                    <div class="post-item">
                        <span>소모임 모집</span>
                        <span>2025.05.01</span>
                    </div>
                    <hr class="divider">
                </div>
                <!-- 추가 게시글 -->
            </div>
        </div>`;
        area.appendChild(box);
    });
}

//검색 기능
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchForm = document.querySelector("form.search-box");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const keyword = searchInput.value.toLowerCase();

            const filtered = posts.filter(post =>
                post.title.toLowerCase().includes(keyword) ||
                post.content.toLowerCase().includes(keyword)
            );

            renderPosts(filtered);
        });
    }
});

//분야별 필터링 기능
function filterPosts() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();

    const checkedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(cb => cb.value);

    const filtered = posts.filter(post => {
        const matchCategory = checkedCategories.length === 0 || checkedCategories.includes(post.category);
        const matchKeyword =
            post.title.toLowerCase().includes(keyword) ||
            post.content.toLowerCase().includes(keyword);

        return matchCategory && matchKeyword;
    });

    renderPosts(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector("form.search-box");

    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            filterPosts();
        });
    }

    document.querySelectorAll(".category-filter").forEach(cb => {
        cb.addEventListener("change", filterPosts);
    });
});

//접수상태 필터링 기능
function filterPosts() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();

    const checkedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(cb => cb.value);

    const checkedStatuses = Array.from(document.querySelectorAll('.status-filter:checked'))
        .map(cb => cb.value);

    const filtered = posts.filter(post => {
        const matchKeyword =
            post.title.toLowerCase().includes(keyword) ||
            post.content.toLowerCase().includes(keyword);

        const matchCategory =
            checkedCategories.length === 0 || checkedCategories.includes(post.category);

        const matchStatus =
            checkedStatuses.length === 0 || checkedStatuses.includes(getStatus(post.deadline));

        return matchKeyword && matchCategory && matchStatus;
    });

    renderPosts(filtered);
}
document.querySelectorAll(".category-filter, .status-filter").forEach(cb => {
    cb.addEventListener("change", filterPosts);
});


window.onload = () => renderPosts(posts);