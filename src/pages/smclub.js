let posts = [];
let smclubPosts = [];
let bookmarkList = [];
// 소모임 데이터 서버로부터 가져오기
fetch("/smclubData")
    .then(res => res.json())
    .then(data => {
        console.log(data);
        posts = data;
    })
    .then(()=>{
        renderPosts(posts);
    });
// 소모임 글 데이터
fetch("/postData?postType=smclub")
    .then(res => res.json())
    .then(data => {
        console.log("글 데이터", data);
        smclubPosts = data;
    })
    .then(()=>{
        renderPosts(posts);
    });
// bookmarkList 데이터 가져오기
if(localStorage.getItem("loggedInUser")){
    fetch(`/bookmarkList?studentId=${localStorage.getItem("loggedInUser")}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data === null) {
                bookmarkList = [];
            } else {
                bookmarkList = data;
            }
        })
        .then(()=>{
            renderPosts(posts);
        });
}

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
        const rawHtml = post.content; // 글 내용 가져오기
        const plainText = rawHtml.replace(/<[^>]*>?/gm, ''); // 모든 HTML 태그 제거
        const length = plainText.trim().length; // 텍스트 길이
        const isInBookmarkList = bookmarkList.includes(post._id); // bookmarkList 안에 있는지
        // 해당 소모임 포스트 가져오기
        smclubPosts.forEach(post=>console.log(post.clubId));
        const relatedPosts = smclubPosts.filter(p => p.smclubId === post._id);
        // 최신 글 정렬 후 가져오기
        relatedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestPostsHtml = relatedPosts.slice(0, 3).map(p =>`
            <!-- 게시글 -->
            <div class="post-list">
                <div onclick="document.location.href = '/content/${p._id}?type=smclub'" class="post-item">
                    <span class="post-title">${p.title}</span>
                    <span style="float: right;">${p.createdDate}</span>
                </div>
                <hr class="divider">
            </div>
            `
        ).join('');
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
                    ${post.deadline ? `
                    <div class="status-left">
                        ${getDDay(post.deadline)}
                    </div>
                    ` : ''}
                    <i class="status-right ${isInBookmarkList ? "fa-solid" : "fa-regular"} fa-heart heart-icon" data-id=${post._id}> 
                    <span>${post.bookmarkNum}</span></i>
                </div>

                <!-- 소모임 정보 -->
                <div class="info">
                    <h2 class="title" onclick="location.href='/smclubInfo/${post._id}'">${post.title}</h2>
                    <p class="description">${length > 50 ? plainText.slice(0, 50) + "..." : plainText}</p>

                    <!-- <div class="period-wrapper">
                        <div class="period">
                            <span class="period-label">모집 기간</span>
                            <span class="period-dates"> ~ ${post.deadline}</span>
                        </div>
                    </div> -->

                    <!-- 해시태그들 -->
                    <div class="hashtags">
                        <span class="hashtag">${post.category}</span>
                        <!-- <span class="hashtag">#화목</span> -->
                        <!-- 추가 해시태그 -->
                    </div>
                </div>
            </div>

            <!-- 최신 글 -->
            <div class="latest-posts">
                <h3 class="latest-title">최신 글</h3>
                <hr class="divider">
                ${latestPostsHtml || '<div class="post-item"><span>등록된 글 없음</span></div>'}
            </div>
        </div>`;
        area.appendChild(box);
    });
}

//검색 기능 (중복 코드라 없앰)
// document.addEventListener("DOMContentLoaded", () => {
//     const searchInput = document.getElementById("searchInput");
//     const searchForm = document.querySelector("form.search-box");

//     if (searchForm && searchInput) {
//         searchForm.addEventListener("submit", (e) => {
//             e.preventDefault();

//             const keyword = searchInput.value.toLowerCase();

//             const filtered = posts.filter(post =>
//                 post.title.toLowerCase().includes(keyword) ||
//                 post.content.toLowerCase().includes(keyword)
//             );

//             renderPosts(filtered);
//         });
//     }
// });

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

    const checkedClubNames = Array.from(document.querySelectorAll('.club-name-filter:checked'))
        .map(cb => cb.value);

    const checkedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(cb => cb.value);

    const checkedStatuses = Array.from(document.querySelectorAll('.status-filter:checked'))
        .map(cb => cb.value);

    const filtered = posts.filter(post => {
        const matchKeyword =
            post.title.toLowerCase().includes(keyword) ||
            post.content.toLowerCase().includes(keyword);

        const matchClubName = 
            checkedClubNames.length === 0 || checkedClubNames.includes(post.title);

        const matchCategory =
            checkedCategories.length === 0 || checkedCategories.includes(post.category);

        const matchStatus =
            checkedStatuses.length === 0 || checkedStatuses.includes(getStatus(post.deadline));

        return matchClubName && matchKeyword && matchCategory && matchStatus;
    });

    renderPosts(filtered);
}
document.querySelectorAll(".club-name-filter, .category-filter, .status-filter").forEach(cb => {
    cb.addEventListener("change", filterPosts);
});


window.onload = () => renderPosts(posts);

// jquery ajax로 하트 클릭하면 post 요청 보내기
$(document).on('click', '.heart-icon', function (e) {
    if(!localStorage.getItem("loggedInUser")){
        alert("로그인이 필요합니다");
        return;
    }
    let sid = e.currentTarget.dataset.id; // 포스트 id
    let item = e.currentTarget;

    // 북마크리스트에 있는지 확인
    if (bookmarkList.includes(sid)) {
        // 있으면 제거
        bookmarkList = bookmarkList.filter(elem => elem !== sid);
        console.log(bookmarkList);
        $.ajax({
            type: 'post',
            url: '/deleteBookmark?type=smclub',
            data: {
                bookmarkList: bookmarkList,
                studentId: localStorage.getItem("loggedInUser"),
                _id: sid,
            }
        }).done(function (result) {
            item.classList.replace('fa-solid', 'fa-regular');
            let bookmarkNum = item.querySelector("span").innerText;
            item.querySelector("span").innerText = Number(bookmarkNum) - 1;
            console.log("북마크 제거 표시");
        }).fail(function (xhr, textStatus, errorThrown) {
            console.log("북마크 제거 실패");
            console.log(xhr, textStatus, errorThrown);
        });
    } else {
        // 없으면 추가
        bookmarkList.push(sid);
        $.ajax({
            type: 'post',
            url: '/addBookmark?type=smclub',
            data: {
                bookmarkList: bookmarkList,
                studentId: localStorage.getItem("loggedInUser"),
                _id: sid,
            }
        }).done(function (result) {
            item.classList.replace('fa-regular', 'fa-solid');
            let bookmarkNum = item.querySelector("span").innerText;
            item.querySelector("span").innerText = Number(bookmarkNum) + 1;
            console.log("북마크 추가 표시");
        }).fail(function (xhr, textStatus, errorThrown) {
            console.log("북마크 추가 실패");
            console.log(xhr, textStatus, errorThrown);
        });
    }
});