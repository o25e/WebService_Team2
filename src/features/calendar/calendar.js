document.addEventListener('DOMContentLoaded', function () {
  const calendar = document.getElementById('calendar');

  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  function renderCalendar(month, year) {
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendar.innerHTML = `
      <div class="calendar-header">
        <button id="prev">&lt;</button>
        <div>${year}년 ${month + 1}월</div>
        <button id="next">&gt;</button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day">일</div>
        <div class="calendar-day">월</div>
        <div class="calendar-day">화</div>
        <div class="calendar-day">수</div>
        <div class="calendar-day">목</div>
        <div class="calendar-day">금</div>
        <div class="calendar-day">토</div>
      </div>
      <div class="calendar-grid calendar-dates"></div>

      <!-- Modal -->
      <div class="calendar-modal hidden" id="event-modal">
        <div class="modal-content">
          <span id="close-modal" class="modal-close">&times;</span>
          <h3 id="modal-title"></h3>
          <textarea id="event-text" placeholder="이벤트를 입력하세요"></textarea>
          <button id="save-event">저장</button>
        </div>
      </div>
    `;

    const dateGrid = calendar.querySelector('.calendar-dates');
    let dateHTML = "";

    for (let i = 0; i < firstDay; i++) {
      dateHTML += `<div class="calendar-date empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month + 1}-${day}`;
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const savedEvent = localStorage.getItem(dateKey) || "";

      dateHTML += `
        <div class="calendar-date${isToday ? " today" : ""}" data-date="${dateKey}">
          ${day}
          ${savedEvent ? `<div class="event-dot"></div>` : ""}
        </div>
      `;
    }

    dateGrid.innerHTML = dateHTML;

    // 버튼 이벤트
    document.getElementById('prev').addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentMonth, currentYear);
    });

    document.getElementById('next').addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentMonth, currentYear);
    });

    // 날짜 클릭 이벤트
    document.querySelectorAll('.calendar-date[data-date]').forEach(cell => {
      cell.addEventListener('click', () => {
        const date = cell.getAttribute('data-date');
        const modal = document.getElementById('event-modal');
        const title = document.getElementById('modal-title');
        const textarea = document.getElementById('event-text');

        title.textContent = `📅 ${date} 이벤트`;
        textarea.value = localStorage.getItem(date) || "";
        modal.classList.remove('hidden');

        document.getElementById('save-event').onclick = () => {
          const text = textarea.value.trim();
          if (text) {
            localStorage.setItem(date, text);
          } else {
            localStorage.removeItem(date);
          }
          modal.classList.add('hidden');
          renderCalendar(currentMonth, currentYear); // 재렌더링
        };

        document.getElementById('close-modal').onclick = () => {
          modal.classList.add('hidden');
        };
      });
    });
  }

  renderCalendar(currentMonth, currentYear);
});
