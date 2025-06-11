// HTML이 모두 로드되었을 때 실행
document.addEventListener("DOMContentLoaded", () => {
  let selectedCell = null; // 현재 선택된 날짜 셀 저장용 변수

  // 주요 DOM 요소 참조
  const monthYear = document.getElementById("monthYear");
  const calendarBody = document.getElementById("calendar-body");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const eventList = document.getElementById("event-list");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let current = new Date(); // 현재 날짜 기준
  let selectedCategory = "all"; // 선택된 카테고리 (기본값: 전체)
  let events = {}; // 날짜별 이벤트 객체

  // 특정 날짜의 이벤트 목록 렌더링
  function renderEventList(dateStr) {
    eventList.innerHTML = "";
    const dayEvents = events[dateStr];
    if (!dayEvents) {
      // 이벤트가 없을 경우 메시지 표시
      const li = document.createElement("li");
      li.textContent = "일정이 없습니다.";
      li.style.fontStyle = "italic";
      eventList.appendChild(li);
      return;
    }

    const eventArray = Array.isArray(dayEvents) ? dayEvents : [dayEvents];
    const filtered = eventArray.filter(ev => selectedCategory === "all" || ev.category === selectedCategory);

    if (filtered.length === 0) {
      const li = document.createElement("li");
      li.textContent = "일정이 없습니다.";
      li.style.fontStyle = "italic";
      eventList.appendChild(li);
      return;
    }

    // 필터된 일정 렌더링
    filtered.forEach(ev => {
      const li = document.createElement("li");
      li.textContent = `[${dateStr}] [${categoryLabel(ev.category)}] ${ev.text}`;
      eventList.appendChild(li);
    });
  }

  // 해당 카테고리의 이번 달 전체 이벤트 목록 렌더링
  function renderCategoryEvents(category) {
    eventList.innerHTML = "";
    const year = current.getFullYear();
    const month = current.getMonth();

    const allDates = Object.keys(events).sort();
    let filteredEvents = [];

    allDates.forEach(date => {
      const dayEvents = events[date];
      const eventArray = Array.isArray(dayEvents) ? dayEvents : [dayEvents];
      const eventDate = new Date(date);

      if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
        eventArray.forEach(ev => {
          if (category === "all" || ev.category === category) {
            filteredEvents.push({ date, ...ev });
          }
        });
      }
    });

    if (filteredEvents.length === 0) {
      const li = document.createElement("li");
      li.textContent = "일정이 없습니다.";
      li.style.fontStyle = "italic";
      eventList.appendChild(li);
      return;
    }

    // 이벤트 리스트 출력
    filteredEvents.forEach(ev => {
      const li = document.createElement("li");
      li.textContent = `[${ev.date}] [${categoryLabel(ev.category)}] ${ev.text}`;
      eventList.appendChild(li);
    });
  }

  // 카테고리 코드 → 한글 레이블로 변환
  function categoryLabel(code) {
    switch (code) {
      case "club": return "동아리";
      case "smclub": return "소모임";
      case "etcclub": return "기타";
      default: return "기타";
    }
  }

  // 달력 생성 함수
  function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    monthYear.textContent = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    calendarBody.innerHTML = ""; // 이전 달력 초기화
    let row = document.createElement("tr");

    // 첫 주 빈칸 채우기
    for (let i = 0; i < firstDay; i++) {
      row.appendChild(document.createElement("td"));
    }

    for (let day = 1; day <= lastDate; day++) {
      const cell = document.createElement("td");
      cell.textContent = day;

      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      cell.dataset.date = dateStr;

      // 오늘 날짜 표시 및 자동 선택
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        cell.classList.add("today");

        const span = document.createElement("span");
        span.textContent = day;
        span.classList.add("today-number");
        cell.textContent = "";
        cell.appendChild(span);

        cell.classList.add("selected");
        selectedCell = cell;
        renderEventList(dateStr);
      }

      // 해당 날짜의 이벤트 정보 처리
      const dayEvents = events[dateStr];
      if (dayEvents) {
        const eventArray = Array.isArray(dayEvents) ? dayEvents : [dayEvents];

        const hasEventForFilter = eventArray.some(ev =>
          selectedCategory === "all" || ev.category === selectedCategory
        );

        if (hasEventForFilter) {
          cell.classList.add("has-event");
        }

        // '전체' 필터일 경우 → 다중 색상 배경 처리
        if (selectedCategory === "all") {
          const categorySet = new Set();
          eventArray.forEach(ev => categorySet.add(ev.category));

          const gradientColors = [];

          // 각 카테고리에 따른 색상 가져오기 (임시 td를 통해 CSS 스타일 추출)
          if (categorySet.has("club")) {
            const temp = document.createElement("td");
            temp.classList.add("club-filtered");
            document.body.appendChild(temp);
            const color = getComputedStyle(temp).backgroundColor;
            gradientColors.push(color);
            cell.classList.add("club-filtered");
            document.body.removeChild(temp);
          }

          if (categorySet.has("smclub")) {
            const temp = document.createElement("td");
            temp.classList.add("smclub-filtered");
            document.body.appendChild(temp);
            const color = getComputedStyle(temp).backgroundColor;
            gradientColors.push(color);
            cell.classList.add("smclub-filtered");
            document.body.removeChild(temp);
          }

          if (categorySet.has("etcclub")) {
            const temp = document.createElement("td");
            temp.classList.add("etcclub-filtered");
            document.body.appendChild(temp);
            const color = getComputedStyle(temp).backgroundColor;
            gradientColors.push(color);
            cell.classList.add("etcclub-filtered");
            document.body.removeChild(temp);
          }

          // 그라디언트 배경 적용
          if (gradientColors.length > 0) {
            const step = 100 / gradientColors.length;
            const gradientStr = gradientColors.map((color, index) => {
              const start = index * step;
              const end = (index + 1) * step;
              return `${color} ${start}% ${end}%`;
            }).join(", ");
            cell.style.background = `linear-gradient(to bottom, ${gradientStr})`;
            cell.style.color = "black"; // 가독성 확보
          }
        } else {
          // 특정 카테고리만 선택된 경우
          const hasSelectedCategory = eventArray.some(ev => ev.category === selectedCategory);
          if (hasSelectedCategory) {
            if (selectedCategory === "club") {
              cell.classList.add("club-filtered");
            } else if (selectedCategory === "smclub") {
              cell.classList.add("smclub-filtered");
            } else if (selectedCategory === "etcclub") {
              cell.classList.add("etcclub-filtered");
            }
          }
        }

        // 아래는 점(dot) 표시용 코드 - 필요 시 주석 해제
        /*
        eventArray.forEach(ev => {
          const dot = document.createElement("span");
          dot.classList.add("deadline-dot");
          if (ev.category === "club") dot.classList.add("club");
          else if (ev.category === "smclub") dot.classList.add("smclub");
          else dot.classList.add("etcclub");
          cell.appendChild(dot);
        });
        */
      }

      // 날짜 클릭 시 이벤트 리스트 표시 및 선택된 셀 변경
      cell.addEventListener("click", () => {
        if (selectedCell) {
          selectedCell.classList.remove("selected");
        }
        cell.classList.add("selected");
        selectedCell = cell;
        renderEventList(dateStr);
      });

      row.appendChild(cell);

      // 한 줄이 끝나면 새로운 <tr> 추가
      if ((firstDay + day) % 7 === 0 || day === lastDate) {
        calendarBody.appendChild(row);
        row = document.createElement("tr");
      }
    }
  }

  // 이전 달 버튼 클릭 시
  prevMonthBtn.addEventListener("click", () => {
    current.setMonth(current.getMonth() - 1);
    generateCalendar(current);
    eventList.innerHTML = "<li>날짜를 선택해주세요.</li>";
  });

  // 다음 달 버튼 클릭 시
  nextMonthBtn.addEventListener("click", () => {
    current.setMonth(current.getMonth() + 1);
    generateCalendar(current);
    eventList.innerHTML = "<li>날짜를 선택해주세요.</li>";
  });

  // 필터 버튼 클릭 시
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.category;
      generateCalendar(current); // 필터에 맞는 달력 표시
      renderCategoryEvents(selectedCategory); // 리스트에도 반영
    });
  });

  // 북마크된 일정 불러오기 (로그인된 유저 기반)
  function loadBookmarkedEvents() {
    const studentId = localStorage.getItem('loggedInUser');
    if (!studentId) {
      console.warn("로그인된 유저가 없어 일정 로딩 안함.");
      generateCalendar(current);
      return;
    }

    fetch(`/club/data/bookmarked_club_post?studentId=${studentId}`)
      .then(res => res.json())
      .then(posts => {
        const clubPosts = posts.filter(post => post.category === 'club');
        const smclubPosts = posts.filter(post => post.category === 'smclub');
        const etcclubPosts = posts.filter(post => post.category === 'etcclub');

        events = {}; // 초기화 후 다시 채움

        // 각 카테고리별 이벤트 저장
        [
          { posts: clubPosts, category: 'club' },
          { posts: smclubPosts, category: 'smclub' },
          { posts: etcclubPosts, category: 'etcclub' }
        ].forEach(({ posts, category }) => {
          posts.forEach(post => {
            const dateStr = post.deadline;
            if (!dateStr) return;

            if (!events[dateStr]) {
              events[dateStr] = [];
            }

            events[dateStr].push({
              text: post.title || "제목 없음",
              category: category
            });
          });
        });

        generateCalendar(current);
        renderCategoryEvents(selectedCategory);
      })
      .catch(err => {
        console.error("API 호출 실패:", err);
        generateCalendar(current);
      });
  }

  // 페이지 로드시 북마크 이벤트 불러오기
  loadBookmarkedEvents();
});