document.addEventListener('DOMContentLoaded', () => {
    generateCards();
    setupEventListeners();
    createFilters(); // 초기 필터 생성
});

// 카테고리 및 상태 필터 데이터
const filterOptions = {
    categories: [
        '공연/댄스', '학술/전공', '체육', 
        '여행/사진/산악', '창업/비즈', '스/홍보',
        '국제/교류', '예술/문화', '봉사',
        '게임/보드/취미', '사회참여/시사/토론'
    ],
    statuses: ['모집 진행 중', '모집완료', '모집마감']
};

// 카드 생성 함수
function generateCards() {
    const container = document.querySelector('.card-container');
    container.innerHTML = '';
    
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const activeFilters = getActiveFilters();

    activities.forEach((activity, index) => {
        if (isCardVisible(activity, activeFilters)) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <button class="delete-btn" onclick="deleteActivity(${index})">×</button>
                <div class="card-image" onclick="showDetail(${index})">
                    ${activity.image ? 
                        `<img src="${activity.image}" style="width:100%;height:100%;object-fit:cover;">` : 
                        `<div style="height:100%;background:#eee;"></div>`}
                </div>
                <div class="card-content" onclick="showDetail(${index})">
                    <span class="card-status status-${activity.status}">${getStatusText(activity.status)}</span>
                    <h3>${activity.title}</h3>
                    <p>${activity.description}</p>
                    <div class="card-tags">
                        ${activity.tags.map(tag => `<span>#${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

// 필터 생성 함수
function createFilters() {
    // 분야 필터 생성
    const categoryContainer = document.getElementById('categoryFilters');
    categoryContainer.innerHTML = filterOptions.categories.map(category => `
        <div class="filter-item">
            <input type="checkbox" id="${category}" onchange="handleFilterChange()">
            <label for="${category}">${category}</label>
        </div>
    `).join('');

    // 상태 필터 생성
    const statusContainer = document.getElementById('statusFilters');
    statusContainer.innerHTML = filterOptions.statuses.map(status => `
        <div class="filter-item">
            <input type="checkbox" id="${status}" onchange="handleFilterChange()">
            <label for="${status}">${status}</label>
        </div>
    `).join('');
}

// 활성 필터 확인
function getActiveFilters() {
    return {
        categories: [...document.querySelectorAll('#categoryFilters input:checked')].map(cb => cb.id),
        statuses: [...document.querySelectorAll('#statusFilters input:checked')].map(cb => cb.id)
    };
}

// 카드 표시 여부 결정
function isCardVisible(activity, filters) {
    // 분야 필터
    const categoryMatch = filters.categories.length === 0 || 
        activity.tags.some(tag => filters.categories.includes(tag));
    
    // 상태 필터
    const statusText = getStatusText(activity.status);
    const statusMatch = filters.statuses.length === 0 || 
        filters.statuses.includes(statusText);

    return categoryMatch && statusMatch;
}

// 필터 변경 핸들러
function handleFilterChange() {
    generateCards();
}

// 필터 토글 로직
let currentFilter = null;
function toggleFilter(type) {
    const dropdown = document.getElementById('filterDropdown');
    const buttons = document.querySelectorAll('.nav-button');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (currentFilter === type || type === 'home') {
        dropdown.style.display = 'none';
        currentFilter = null;
        if (type === 'home') resetFilters();
    } else {
        document.querySelector(`button[onclick="toggleFilter('${type}')"]`)
            .classList.add('active');
        dropdown.style.display = 'block';
        currentFilter = type;
        handleFilterChange(); // 필터 새로고침
    }
}

// 필터 초기화
function resetFilters() {
    document.querySelectorAll('.dropdown input[type="checkbox"]')
        .forEach(checkbox => checkbox.checked = false);
    generateCards();
}

// 상태 텍스트 변환
function getStatusText(status) {
    return {
        ongoing: '모집 진행 중',
        full: '모집완료',
        ended: '모집마감'
    }[status];
}

// 카드 삭제
function deleteActivity(index) {
    if(confirm('정말 삭제하시겠습니까?')) {
        let activities = JSON.parse(localStorage.getItem('activities'));
        activities.splice(index, 1);
        localStorage.setItem('activities', JSON.stringify(activities));
        generateCards();
    }
}

// 상세 정보 표시
function showDetail(index) {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const activity = activities[index];
    
    const modalContent = `
        <h2>${activity.title}</h2>
        <p class="card-status status-${activity.status}">${getStatusText(activity.status)}</p>
        ${activity.image ? `<img src="${activity.image}" style="max-width:100%;margin:20px 0;">` : ''}
        <div style="margin:15px 0">
            ${activity.tags.map(tag => `<span>#${tag}</span>`).join(' ')}
        </div>
        <p>${activity.description}</p>
    `;
    
    document.getElementById('modalContent').innerHTML = modalContent;
    document.getElementById('detailModal').style.display = 'block';
}

// 모달 닫기
function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// 사이드바 토글
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.toggle('active');
    overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
}

// 이벤트 리스너 설정
function setupEventListeners() {
    window.onclick = function(event) {
        // 모달 외부 클릭 시 닫기
        if (event.target == document.getElementById('detailModal')) {
            closeModal();
        }
        // 드롭다운 외부 클릭 시 닫기
        if (!event.target.closest('.nav-button') && !event.target.closest('.dropdown')) {
            document.getElementById('filterDropdown').style.display = 'none';
            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        }
    }
}