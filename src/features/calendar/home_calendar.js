document.addEventListener("DOMContentLoaded", () => {
  const monthYear = document.getElementById("monthYear");
  const calendarBody = document.getElementById("calendar-body");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  const modal = document.getElementById("event-modal");
  const modalDate = document.getElementById("modal-date");
  const eventInput = document.getElementById("event-input");
  const saveEventBtn = document.getElementById("save-event");
  const closeModalBtn = document.getElementById("close-modal");
  const eventList = document.getElementById("event-list");

  const filterButtons = document.querySelectorAll(".filter-btn");

  let current = new Date();
  let selectedDate = null;
  let selectedCategory = "all";

  let events = JSON.parse(localStorage.getItem("calendarEvents") || "{}");

  function saveEvents() {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }

  function openModal(dateStr) {
    selectedDate = dateStr;
    modalDate.textContent = `${dateStr} 일정`;
    renderEventList(dateStr);
    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
    eventInput.value = "";
  }

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

    // 모달 입력 필드에는 첫 번째 이벤트 내용 및 카테고리 세팅 (편집용)
    eventInput.value = eventArray[0].text || "";
    const radios = document.querySelectorAll("input[name='event-category']");
    radios.forEach(r => {
      r.checked = eventArray[0].category === r.value;
    });
  }


  function renderFilteredEventList(category) {
    eventList.innerHTML = "";

    if (category === "all") {
      eventList.innerHTML = "<li>필터를 선택하세요.</li>";
      return;
    }

    const filteredEvents = Object.entries(events).flatMap(([date, ev]) => {
      const eventArray = Array.isArray(ev) ? ev : [ev];
      return eventArray
        .filter(event =>
          (category === "bookmark" && event.isBookmarked) ||
          (event.category === category && event.isBookmarked)
        )
        .map(event => ({ date, event }));
    });

    if (filteredEvents.length === 0) {
      const li = document.createElement("li");
      li.textContent = `${categoryLabel(category)} 북마크 일정이 없습니다.`;
      li.style.fontStyle = "italic";
      eventList.appendChild(li);
      return;
    }

    filteredEvents.forEach(({ date, event }) => {
      const li = document.createElement("li");
      li.textContent = `${date} [${categoryLabel(event.category)}] ${event.text}`;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => openModal(date));
      eventList.appendChild(li);
    });
  }


  function categoryLabel(code) {
    switch (code) {
      case "club": return "동아리";
      case "group": return "소모임";
      case "etc": return "기타";
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
        // dayEvents가 배열인지 확인
        const eventArray = Array.isArray(dayEvents) ? dayEvents : [dayEvents];

        // 선택된 필터에 맞는 이벤트가 하나라도 있으면 표시
        const hasEventForFilter = eventArray.some(ev =>
          selectedCategory === "all" ||
          ev.category === selectedCategory ||
          (selectedCategory === "bookmark" && ev.isBookmarked)
        );

        if (hasEventForFilter) {
          cell.classList.add("has-event");
        }

        // 점 표시 (북마크 필터 및 카테고리별 색상)
        eventArray.forEach(ev => {
          if (ev.isBookmarked &&
            (selectedCategory === "all" || selectedCategory === "bookmark")) {
            const dot = document.createElement("span");
            dot.classList.add("deadline-dot");

            if (ev.category === "club") dot.classList.add("club");
            else if (ev.category === "group") dot.classList.add("group");
            else dot.classList.add("etc");

            cell.appendChild(dot);
          }
        });

        // 동아리 필터 선택 시 배경 붉은색 처리
        if (
          selectedCategory === "club" &&
          eventArray.some(ev => ev.category === "club")
        ) {
          cell.classList.add("club-filtered");
        }
      }

      cell.addEventListener("click", () => openModal(dateStr));
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

  saveEventBtn.addEventListener("click", () => {
    const value = eventInput.value.trim();
    const category = document.querySelector("input[name='event-category']:checked")?.value || "etc";

    if (!selectedDate) return;

    if (value) {
      // 기존 이벤트 배열 유지 혹은 새 배열 생성
      let eventArray = events[selectedDate];
      if (!eventArray) {
        events[selectedDate] = [{ text: value, category, isBookmarked: false }];
      } else {
        eventArray = Array.isArray(eventArray) ? eventArray : [eventArray];
        // 편의상 첫 이벤트만 업데이트 (필요 시 수정 가능)
        eventArray[0] = { text: value, category, isBookmarked: eventArray[0]?.isBookmarked || false };
        events[selectedDate] = eventArray;
      }
    } else {
      // 일정 삭제: 모든 이벤트 삭제 (필요 시 첫 이벤트만 삭제 등으로 변경 가능)
      delete events[selectedDate];
    }

    saveEvents();
    generateCalendar(current);
    renderEventList(selectedDate);
    closeModal();
  });

  closeModalBtn.addEventListener("click", closeModal);

  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
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
      console.warn("로그인된 유저가 없어 북마크 일정 로딩 안함.");
      generateCalendar(current);
      return;
    }

    // 기존 북마크 일정 모두 제거
    for (const date in events) {
      if (Array.isArray(events[date])) {
        events[date] = events[date].filter(ev => !ev.isBookmarked);
        if (events[date].length === 0) delete events[date];
      } else if (events[date]?.isBookmarked) {
        delete events[date];
      }
    }

    const urls = [
      { url: `/club/data/bookmarked_club_post?studentId=${studentId}`, category: 'club' },
      { url: `/group/data/bookmarked_smclub_post?studentId=${studentId}`, category: 'group' },
      { url: `/etc/data/bookmarked_etcclub_post?studentId=${studentId}`, category: 'etc' },
    ];

    Promise.all(
      urls.map(api =>
        fetch(api.url)
          .then(res => res.json())
          .then(posts => ({ posts, category: api.category }))
          .catch(err => {
            console.error(`API 호출 실패: ${api.url}`, err);
            return { posts: [], category: api.category };
          })
      )
    )
    .then(results => {
      results.forEach(({ posts, category }) => {
        posts.forEach(post => {
          const dateStr = post.deadline;
          if (!dateStr) return;

          if (!events[dateStr]) {
            events[dateStr] = [];
          } else if (!Array.isArray(events[dateStr])) {
            // 기존 단일 이벤트가 있으면 배열로 변환
            events[dateStr] = [events[dateStr]];
          }

          events[dateStr].push({
            text: post.title || "제목 없음",
            category: category,
            isBookmarked: true,
          });
        });
      });

      saveEvents();
      generateCalendar(current);
    })
    .catch(err => {
      console.error("북마크 일정 통합 로딩 실패:", err);
      generateCalendar(current);
    });
  }


  // 최초 로딩
  loadBookmarkedEvents();
});
