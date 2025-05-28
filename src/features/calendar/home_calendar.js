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

  let current = new Date();
  let selectedDate = null;

  const events = JSON.parse(localStorage.getItem("calendarEvents") || "{}");

  function saveEvents() {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }

  function openModal(dateStr) {
    selectedDate = dateStr;
    modalDate.textContent = `${dateStr} 일정`;
    eventInput.value = events[dateStr] || "";
    modal.classList.remove("hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
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

      const dateStr = `${year}-${month + 1}-${day}`;

      // 오늘 날짜 강조
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        cell.classList.add("today");
      }

      // 일정이 있으면 표시
      if (events[dateStr]) {
        cell.classList.add("has-event");
      }

      // 클릭 이벤트 등록
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
  });

  nextMonthBtn.addEventListener("click", () => {
    current.setMonth(current.getMonth() + 1);
    generateCalendar(current);
  });

  saveEventBtn.addEventListener("click", () => {
    const value = eventInput.value.trim();
    if (value) {
      events[selectedDate] = value;
    } else {
      delete events[selectedDate];
    }
    saveEvents();
    generateCalendar(current);
    closeModal();
  });

  closeModalBtn.addEventListener("click", closeModal);
  window.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  generateCalendar(current);
});
