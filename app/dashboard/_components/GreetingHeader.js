"use client";

const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const MONTHS = ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
                "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"];

function greetingFor(hour) {
  if (hour >= 5 && hour < 11) return "Chào buổi sáng";
  if (hour >= 11 && hour < 14) return "Chào buổi trưa";
  if (hour >= 14 && hour < 18) return "Chào buổi chiều";
  if (hour >= 18 && hour < 22) return "Chào buổi tối";
  return "Đêm an lành";
}

export default function GreetingHeader({ userName = "bạn", now = new Date() }) {
  const hour = now.getHours();
  const greet = greetingFor(hour);
  const dateLabel = `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;

  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">{dateLabel}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">
          {greet}, <span className="text-orange-deep">{userName}</span>
        </h1>
        <p className="mt-1 text-sm text-ink-muted">Hôm nay là một ngày tuyệt vời để chăm sóc bản thân ✨</p>
      </div>

      <button
        type="button"
        className="hidden h-12 w-12 place-items-center rounded-full bg-white shadow-soft md:grid"
        aria-label="Hồ sơ"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    </header>
  );
}
