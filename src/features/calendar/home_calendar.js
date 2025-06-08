document.addEventListener("DOMContentLoaded", () => {
  const monthYear = document.getElementById("monthYear");
  const calendarBody = document.getElementById("calendar-body");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const eventList = document.getElementById("event-list");

  const filterButtons = document.querySelectorAll(".filter-btn");

  let current = new Date();
  let selectedCategory = "all";

  let events = {};

  // 날짜 클릭 시 해당 날짜 이벤트만 보여주기
  function renderEventList(dateStr) {
    eventList.innerHTML = "";

    const dayEvents = events[dateStr];
    if (!dayEvents) {
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

    filtered.forEach(ev => {
      const li = document.createElement("li");
      li.textContent = `[${dateStr}] [${categoryLabel(ev.category)}] ${ev.text}`;
      eventList.appendChild(li);
    });
  }

  function renderCategoryEvents(category) {
    eventList.innerHTML = "";

    // 현재 보고 있는 년도와 월을 가져오기
    const year = current.getFullYear();
    const month = current.getMonth();

    // 모든 날짜 키 정렬
    const allDates = Object.keys(events).sort();
    let filteredEvents = [];

    allDates.forEach(date => {
      const dayEvents = events[date];
      const eventArray = Array.isArray(dayEvents) ? dayEvents : [dayEvents];

      // 날짜 문자열을 Date 객체로 변환
      const eventDate = new Date(date);

      // 현재 달과 연도에 해당하는 일정만 필터링
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

    filteredEvents.forEach(ev => {
      const li = document.createElement("li");
      li.textContent = `[${ev.date}] [${categoryLabel(ev.category)}] ${ev.text}`;
      eventList.appendChild(li);
    });
  }

  function categoryLabel(code) {
    switch (code) {
      case "club": return "동아리";
      case "smclub": return "소모임";
      case "etcclub": return "기타";
      default: return "기타";
    }
  }

  function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    monthYear.textContent = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    calendarBody.innerHTML = "";
    let row = document.createElement("tr");

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

      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        cell.classList.add("today");
      }

      // 이벤트가 있고, 이벤트 날짜가 현재 월에 해당할 때만 처리
      const dayEvents = events[dateStr];
      if (dayEvents) {
        const eventDate = new Date(dateStr);
        if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
          const eventArray = Array.isArray(dayEvents) ? dayEvents : [dayEvents];
          const hasEventForFilter = eventArray.some(ev =>
            selectedCategory === "all" || ev.category === selectedCategory
          );

          if (hasEventForFilter) {
            cell.classList.add("has-event");
          }
          // 배경색 클래스 처리
          cell.classList.remove("club-filtered", "smclub-filtered", "etcclub-filtered");

          if (selectedCategory === "all") {
            const addedClasses = new Set();
            eventArray.forEach(ev => {
              if (ev.category === "club" && !addedClasses.has("club-filtered")) {
                cell.classList.add("club-filtered");
                addedClasses.add("club-filtered");
              } else if (ev.category === "smclub" && !addedClasses.has("smclub-filtered")) {
                cell.classList.add("smclub-filtered");
                addedClasses.add("smclub-filtered");
              } else if (ev.category === "etcclub" && !addedClasses.has("etcclub-filtered")) {
                cell.classList.add("etcclub-filtered");
                addedClasses.add("etcclub-filtered");
              }
            });
          } else {
            // 특정 카테고리 필터별로 해당 카테고리 일정만 배경색 넣기
            if (selectedCategory === "club") {
              if (eventArray.some(ev => ev.category === "club")) {
                cell.classList.add("club-filtered");
              }
            } else if (selectedCategory === "smclub") {
              if (eventArray.some(ev => ev.category === "smclub")) {
                cell.classList.add("smclub-filtered");
              }
            } else if (selectedCategory === "etcclub") {
              if (eventArray.some(ev => ev.category === "etcclub")) {
                cell.classList.add("etcclub-filtered");
              }
            }
          }
          
          // 점 추가하는 코드
          eventArray.forEach(ev => {
            const dot = document.createElement("span");
            dot.classList.add("deadline-dot");
            if (ev.category === "club") dot.classList.add("club");
            else if (ev.category === "smclub") dot.classList.add("smclub");
            else dot.classList.add("etcclub");
            cell.appendChild(dot);
          });
        }
      }

      cell.addEventListener("click", () => {
        renderEventList(dateStr);
      });
      row.appendChild(cell);

      if ((firstDay + day) % 7 === 0 || day === lastDate) {
        calendarBody.appendChild(row);
        row = document.createElement("tr");
      }
    }
  }

  prevMonthBtn.addEventListener("click", () => {
    current.setMonth(current.getMonth() - 1);
    generateCalendar(current);
    eventList.innerHTML = "<li>날짜를 선택해주세요.</li>";
  });

  nextMonthBtn.addEventListener("click", () => {
    current.setMonth(current.getMonth() + 1);
    generateCalendar(current);
    eventList.innerHTML = "<li>날짜를 선택해주세요.</li>";
  });

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.category;
      generateCalendar(current);

      // 필터에 맞는 전체 이벤트 목록 출력
      renderCategoryEvents(selectedCategory);
    });
  });

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

        events = {};

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

  loadBookmarkedEvents();
});
