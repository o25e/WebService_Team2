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

    const event = events[dateStr];
    eventInput.value = event?.text || "";

    const radios = document.querySelectorAll("input[name='event-category']");
    radios.forEach((r) => {
      r.checked = event?.category === r.value;
    });

    modal.classList.remove("hidden");
    renderEventList(dateStr);
  }

  function closeModal() {
    modal.classList.add("hidden");
    eventInput.value = "";
  }

  function renderEventList(dateStr) {
    eventList.innerHTML = "";
    const event = events[dateStr];
    if (event) {
      const li = document.createElement("li");
      li.textContent = `[${categoryLabel(event.category)}] ${event.text}`;
      eventList.appendChild(li);
    } else {
      const li = document.createElement("li");
      li.textContent = "일정이 없습니다.";
      li.style.fontStyle = "italic";
      eventList.appendChild(li);
    }
  }

  function renderFilteredEventList(category) {
    eventList.innerHTML = "";

    if (category === "all") {
      eventList.innerHTML = "<li>필터를 선택하세요.</li>";
      return;
    }

    const filteredEvents = Object.entries(events).filter(
      ([date, event]) =>
        (category === "bookmark" && event.isBookmarked) ||
        (event.category === category && event.isBookmarked)
    );

    if (filteredEvents.length === 0) {
      const li = document.createElement("li");
      li.textContent = `${categoryLabel(category)} 북마크 일정이 없습니다.`;
      li.style.fontStyle = "italic";
      eventList.appendChild(li);
      return;
    }

    filteredEvents.forEach(([date, event]) => {
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

      const event = events[dateStr];
      if (event && (selectedCategory === "all" || event.category === selectedCategory || (selectedCategory === "bookmark" && event.isBookmarked))) {
        cell.classList.add("has-event");
      }

    // 점 추가 (필터별 색상)
    if (
      event &&
      event.isBookmarked === true &&
      (selectedCategory === "all" || selectedCategory === "bookmark")
    ) {
      const dot = document.createElement("span");
      dot.classList.add("deadline-dot");

      if (event.category === "club") dot.classList.add("club");
      else if (event.category === "group") dot.classList.add("group");
      else dot.classList.add("etc");

      cell.appendChild(dot);
    }

    // 동아리 필터 클릭 시 해당 날짜 배경 붉은색 칠하기
    if (
      selectedCategory === "club" &&
      event &&
      event.category === "club"
    ) {
      cell.classList.add("club-filtered");
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
      events[selectedDate] = {
        text: value,
        category,
        isBookmarked: events[selectedDate]?.isBookmarked || false
      };
    } else {
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
      if (events[date]?.isBookmarked) {
        delete events[date];
      }
    }

    // 각 카테고리별 API 주소 (필요에 맞게 변경)
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

          events[dateStr] = {
            text: post.title || "제목 없음",
            category: category,
            isBookmarked: true,
          };
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
