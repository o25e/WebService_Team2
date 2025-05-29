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

  let current = new Date();
  let selectedDate = null;

  // 이벤트 데이터 저장용 (한 날짜에 일정 1개 저장)
  const events = JSON.parse(localStorage.getItem("calendarEvents") || "{}");

  function saveEvents() {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }

  function openModal(dateStr) {
    selectedDate = dateStr;
    modalDate.textContent = `${dateStr} 일정`;
    eventInput.value = events[dateStr] || "";
    modal.classList.remove("hidden");

    renderEventList(dateStr);
  }

  function closeModal() {
    modal.classList.add("hidden");
    eventInput.value = "";
  }

  function renderEventList(dateStr) {
    eventList.innerHTML = "";
    if (events[dateStr]) {
      const li = document.createElement("li");
      li.textContent = events[dateStr];
      eventList.appendChild(li);
    } else {
      const li = document.createElement("li");
      li.textContent = "일정이 없습니다.";
      li.style.fontStyle = "italic";
      eventList.appendChild(li);
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

    // 빈 칸 채우기
    for (let i = 0; i < firstDay; i++) {
      row.appendChild(document.createElement("td"));
    }

    for (let day = 1; day <= lastDate; day++) {
      const cell = document.createElement("td");
      cell.textContent = day;

      // 날짜 포맷: YYYY-MM-DD (월, 일 2자리 맞춤)
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      cell.dataset.date = dateStr; // data-date 속성 추가

      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        cell.classList.add("today");
      }

      if (events[dateStr]) {
        cell.classList.add("has-event");
      }

      cell.addEventListener("click", () => openModal(dateStr));

      row.appendChild(cell);

      // 7일 단위로 줄바꿈
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
    if (!selectedDate) return;

    if (value) {
      events[selectedDate] = value;
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

  // 초기 달력 생성
  generateCalendar(current);
});
