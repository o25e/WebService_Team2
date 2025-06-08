document.addEventListener("DOMContentLoaded", () => {
  const monthYear = document.getElementById("monthYear");
  const calendarBody = document.getElementById("calendar-body");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const eventList = document.getElementById("event-list");

  const filterButtons = document.querySelectorAll(".filter-btn");

  let current = new Date();
  let selectedDate = null;
  let selectedCategory = "all";

  let events = {};

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
    eventArray.forEach(ev => {
      const li = document.createElement("li");
      li.textContent = `[${categoryLabel(ev.category)}] ${ev.text}`;
      eventList.appendChild(li);
    });
  }

  function renderFilteredEventList(category) {
    eventList.innerHTML = "";

    if (category === "all") {
      eventList.innerHTML = "<li>날짜를 선택해주세요.</li>";
      return;
    }

    const filteredEvents = Object.entries(events).flatMap(([date, ev]) => {
      const eventArray = Array.isArray(ev) ? ev : [ev];
      return eventArray
        .filter(event => event.category === category)
        .map(event => ({ date, event }));
    });

    if (filteredEvents.length === 0) {
      const li = document.createElement("li");
      li.textContent = `${categoryLabel(category)} 일정이 없습니다.`;
      li.style.fontStyle = "italic";
      eventList.appendChild(li);
      return;
    }

    filteredEvents.forEach(({ date, event }) => {
      const li = document.createElement("li");
      li.textContent = `${date} [${categoryLabel(event.category)}] ${event.text}`;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => renderEventList(date));
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

      const dayEvents = events[dateStr];
      if (dayEvents) {
        const eventArray = Array.isArray(dayEvents) ? dayEvents : [dayEvents];

        const hasEventForFilter = eventArray.some(ev =>
          selectedCategory === "all" ||
          ev.category === selectedCategory
        );

        if (hasEventForFilter) {
          cell.classList.add("has-event");
        }

        eventArray.forEach(ev => {
          const dot = document.createElement("span");
          dot.classList.add("deadline-dot");

          if (ev.category === "club") dot.classList.add("club");
          else if (ev.category === "smclub") dot.classList.add("smclub");
          else dot.classList.add("etcclub");

          cell.appendChild(dot);
        });

        if (
          selectedCategory === "club" &&
          eventArray.some(ev => ev.category === "club")
        ) {
          cell.classList.add("club-filtered");
        }
      }

      cell.addEventListener("click", () => renderEventList(dateStr));
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

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.dataset.category;
      generateCalendar(current);

      if (selectedCategory === "all") {
        eventList.innerHTML = "<li>날짜를 선택해주세요.</li>";
      } else {
        renderFilteredEventList(selectedCategory);
      }
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
        // category 별로 분리
        const clubPosts = posts.filter(post => post.category === 'club');
        const smclubPosts = posts.filter(post => post.category === 'smclub');
        const etcclubPosts = posts.filter(post => post.category === 'etcclub');

        // 이벤트 객체 초기화 (필요시)
        Object.keys(events).forEach(key => delete events[key]);

        // 각 카테고리별 posts를 events에 넣기
        [ 
          {posts: clubPosts, category: 'club'}, 
          {posts: smclubPosts, category: 'smclub'}, 
          {posts: etcclubPosts, category: 'etcclub'} 
        ].forEach(({posts, category}) => {
          posts.forEach(post => {
            const dateStr = post.deadline;
            if (!dateStr) return;

            if (!events[dateStr]) {
              events[dateStr] = [];
            } else if (!Array.isArray(events[dateStr])) {
              events[dateStr] = [events[dateStr]];
            }

            events[dateStr].push({
              text: post.title || "제목 없음",
              category: category
            });
          });
        });

        generateCalendar(current);
      })
      .catch(err => {
        console.error("API 호출 실패:", err);
        generateCalendar(current);
      });
  }
  loadBookmarkedEvents();
});
