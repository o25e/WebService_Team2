// 글 데이터 서버로부터 가져오기
let posts = [];
fetch("/club/data")
.then(res=>res.json())
.then(data=>{
    console.log(data);
    posts = data;
    renderPosts(posts);
});

//posts에서 쓴 deadline dday로 보여주기
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
        <!-- 모임 카드 -->
        <div class="meeting-card">
            <!-- 모임 정보 -->
            <div class="meeting-info">
                <h2 class="meeting-title">${post.title}</h2>
                <p class="meeting-description">${post.content.length > 50 ? post.content.slice(0, 50)+"..." : post.content}</p>
            </div>
        </div>`;
        area.appendChild(box);
    });
}