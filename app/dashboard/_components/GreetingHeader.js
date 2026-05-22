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

  const initial = (userName || "?").trim().charAt(0).toUpperCase();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-deep ring-1 ring-sage/15">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
          {dateLabel}
        </span>
        <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-ink md:text-[32px]">
          {greet}, <span className="text-orange-deep">{userName}</span>
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">Hôm nay là một ngày tuyệt vời để chăm sóc bản thân.</p>
      </div>

      <button
        type="button"
        className="flex items-center gap-3 self-start rounded-2xl bg-white p-2 pr-4 shadow-soft ring-1 ring-cream-deep/60 transition hover:shadow-lift sm:self-auto"
        aria-label="Hồ sơ"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange text-base font-bold text-white">
          {initial}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-[10px] font-medium uppercase tracking-wider text-ink-muted">Thành viên</span>
          <span className="block text-[13px] font-semibold text-ink">{userName}</span>
        </span>
      </button>
    </header>
  );
}
