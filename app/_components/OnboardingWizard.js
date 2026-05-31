'use client';

import { useState } from 'react';

const ACTIVITY_LEVELS = [
  { label: 'Ít vận động', sub: 'Hầu như ngồi/nằm', value: 1.2 },
  { label: 'Nhẹ', sub: '1-3 buổi tập/tuần', value: 1.375 },
  { label: 'Vừa', sub: '3-5 buổi tập/tuần', value: 1.55 },
  { label: 'Nhiều', sub: '6-7 buổi tập/tuần', value: 1.725 },
];
const GOALS = [
  { label: 'Giảm cân nhanh', sub: '-500 kcal/ngày', value: -500 },
  { label: 'Giảm cân nhẹ', sub: '-250 kcal/ngày', value: -250 },
  { label: 'Duy trì', sub: 'Giữ cân hiện tại', value: 0 },
  { label: 'Tăng cân', sub: '+300 kcal/ngày', value: 300 },
];

const TOTAL = 5;

export default function OnboardingWizard({ initial = {}, suggestedNick = '', onComplete }) {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState(initial.nickname || '');
  const [gender, setGender] = useState(initial.gender || 'male');
  const [age, setAge] = useState(initial.age || 25);
  const [height, setHeight] = useState(initial.height || 165);
  const [weight, setWeight] = useState(initial.weight || 60);
  const [activity, setActivity] = useState(initial.activity || 1.375);
  const [goal, setGoal] = useState(initial.goal ?? 0);

  const numOk = age > 0 && height > 0 && weight > 0;
  const canNext = step !== 2 || numOk;

  const next = () => {
    if (step < TOTAL - 1) setStep(step + 1);
    else finish();
  };
  const back = () => step > 0 && setStep(step - 1);

  const finish = () => {
    onComplete({
      nickname: nickname.trim(),
      gender, age: +age, height: +height, weight: +weight,
      activity: +activity, goal: +goal,
      isManualTarget: false,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-cream flex flex-col max-w-md mx-auto font-sans text-ink">
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-orange' : 'bg-cream-deep'}`} />
          ))}
        </div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Bước {step + 1}/{TOTAL}</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 no-scrollbar">
        {step === 0 && (
          <Section icon="👋" title="Gọi bạn là gì?" desc="Đặt một biệt danh ngắn gọn để hiển thị trong app.">
            <input
              autoFocus type="text" value={nickname} maxLength={40}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') next(); }}
              placeholder={suggestedNick || 'Biệt danh của bạn'}
              className="w-full bg-white ring-1 p-4 rounded-2xl text-[15px] font-semibold outline-none focus:ring-2 focus:ring-orange/30 transition"
            />
            {suggestedNick && !nickname && (
              <button onClick={() => setNickname(suggestedNick)} className="mt-3 text-[12px] font-semibold text-orange-deep hover:underline">
                Dùng &quot;{suggestedNick}&quot;
              </button>
            )}
            <p className="mt-3 text-[11px] text-ink-faint italic">Có thể bỏ trống — app sẽ gọi bạn là &quot;bạn&quot;.</p>
          </Section>
        )}

        {step === 1 && (
          <Section icon="👤" title="Giới tính của bạn?" desc="Giúp tính nhu cầu năng lượng (BMR) chính xác hơn.">
            <div className="flex gap-2 p-1 bg-cream-soft rounded-2xl ring-1">
              {[['male', 'Nam'], ['female', 'Nữ']].map(([v, l]) => (
                <button key={v} onClick={() => setGender(v)} className={`flex-1 py-3.5 rounded-xl text-[14px] font-semibold transition ${gender === v ? 'bg-white text-orange-deep shadow-soft ring-1' : 'text-ink-muted hover:text-ink'}`}>{l}</button>
              ))}
            </div>
          </Section>
        )}

        {step === 2 && (
          <Section icon="📏" title="Chỉ số cơ thể" desc="Tuổi, chiều cao và cân nặng hiện tại.">
            <div className="space-y-3">
              <Field label="Tuổi" unit="tuổi" value={age} onChange={setAge} />
              <Field label="Chiều cao" unit="cm" value={height} onChange={setHeight} decimal />
              <Field label="Cân nặng" unit="kg" value={weight} onChange={setWeight} decimal />
            </div>
            {!numOk && <p className="mt-3 text-[11px] text-orange-deep font-medium">Nhập số lớn hơn 0 cho cả 3 ô.</p>}
          </Section>
        )}

        {step === 3 && (
          <Section icon="🏃" title="Mức vận động?" desc="Chọn mức gần nhất với lối sống của bạn.">
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((l) => (
                <Choice key={l.value} active={activity === l.value} onClick={() => setActivity(l.value)} title={l.label} sub={l.sub} />
              ))}
            </div>
          </Section>
        )}

        {step === 4 && (
          <Section icon="🎯" title="Mục tiêu của bạn?" desc="App sẽ tính lượng calo mỗi ngày theo mục tiêu này.">
            <div className="space-y-2">
              {GOALS.map((l) => (
                <Choice key={l.value} active={goal === l.value} onClick={() => setGoal(l.value)} title={l.label} sub={l.sub} />
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-2 flex gap-3">
        {step > 0 && (
          <button onClick={back} className="px-5 h-13 py-3.5 text-ink bg-cream-soft ring-1 rounded-2xl font-semibold text-[13px] hover:bg-cream-deep transition">Quay lại</button>
        )}
        <button onClick={next} disabled={!canNext} className="flex-1 py-3.5 bg-orange text-white rounded-2xl font-bold text-[14px] shadow-soft ring-1 ring-orange-deep/20 hover:bg-orange-deep active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {step === TOTAL - 1 ? 'Bắt đầu' : 'Tiếp tục'}
        </button>
      </div>
    </div>
  );
}

function Section({ icon, title, desc, children }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-4xl mb-3">{icon}</div>
      <h1 className="text-[24px] font-bold tracking-tight leading-tight">{title}</h1>
      <p className="mt-1.5 mb-6 text-[13px] text-ink-muted leading-relaxed">{desc}</p>
      {children}
    </div>
  );
}

function Field({ label, unit, value, onChange, decimal }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={decimal ? 'text' : 'number'}
          inputMode={decimal ? 'decimal' : 'numeric'}
          value={value ?? ''}
          onChange={(e) => {
            const raw = String(e.target.value).replace(',', '.');
            onChange(decimal ? (parseFloat(raw) || 0) : (parseInt(raw, 10) || 0));
          }}
          className="w-full bg-white ring-1 p-3.5 pr-10 rounded-2xl outline-none font-bold text-[15px] focus:ring-2 focus:ring-orange/30 transition tabular-nums"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-ink-muted">{unit}</span>
      </div>
    </div>
  );
}

function Choice({ active, onClick, title, sub }) {
  return (
    <button onClick={onClick} className={`w-full text-left p-4 rounded-2xl ring-1 transition active:scale-[0.98] ${active ? 'bg-orange-soft ring-orange/40' : 'bg-white ring-cream-deep hover:bg-cream-soft'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-bold text-ink">{title}</p>
          <p className="text-[11px] text-ink-muted mt-0.5">{sub}</p>
        </div>
        <span className={`grid h-5 w-5 place-items-center rounded-full ring-1 transition ${active ? 'bg-orange text-white ring-orange-deep/20' : 'ring-cream-deep'}`}>
          {active && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
        </span>
      </div>
    </button>
  );
}
