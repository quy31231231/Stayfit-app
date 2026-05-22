"use client";

const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const MONTHS = ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
                "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"];

const WELLNESS_QUOTES = [
  "Hôm nay là một ngày tuyệt vời để chăm sóc bản thân.",
  "Cơ thể bạn đang lắng nghe — hãy nuôi dưỡng nó nhẹ nhàng.",
  "Mỗi bữa ăn là một cách nói cảm ơn với cơ thể.",
  "Bạn không cần hoàn hảo, chỉ cần có mặt.",
  "Một ngụm nước cũng là chăm sóc.",
  "Cân bằng quan trọng hơn kỷ luật.",
  "Lắng nghe đói no — cơ thể biết điều nó cần.",
  "Bước nhỏ mỗi ngày tạo nên thay đổi lớn.",
];

function greetingFor(hour) {
  if (hour >= 5 && hour < 11) return "Chào buổi sáng";
  if (hour >= 11 && hour < 14) return "Chào buổi trưa";
  if (hour >= 14 && hour < 18) return "Chào buổi chiều";
  if (hour >= 18 && hour < 22) return "Chào buổi tối";
  return "Đêm an lành";
}

function accentFor(hour) {
  if (hour >= 5 && hour < 11)  return { chip: "bg-sage-soft text-sage-deep ring-sage/15",   dot: "bg-sage" };
  if (hour >= 11 && hour < 17) return { chip: "bg-clay-soft text-clay-deep ring-clay/20",   dot: "bg-clay" };
  if (hour >= 17 && hour < 22) return { chip: "bg-lilac-soft text-lilac-deep ring-lilac/15", dot: "bg-lilac" };
  return { chip: "bg-lilac-soft/70 text-lilac-deep ring-lilac/15", dot: "bg-lilac" };
}

export default function GreetingHeader({ userName = "bạn", now = new Date() }) {
  const hour = now.getHours();
  const greet = greetingFor(hour);
  const accent = accentFor(hour);
  const dateLabel = `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  const quote = WELLNESS_QUOTES[Math.floor(now.getTime() / 3600000) % WELLNESS_QUOTES.length];

  const initial = (userName || "?").trim().charAt(0).toUpperCase();

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1 ${accent.chip}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
          {dateLabel}
        </span>
        <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-ink md:text-[32px]">
          {greet}, <span className="text-orange-deep">{userName}</span>
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted">{quote}</p>
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
