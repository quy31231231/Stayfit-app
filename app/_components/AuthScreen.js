"use client";

import { useState } from 'react';
import { IconUser, IconPhone, IconLock, IconEye, IconEyeOff } from './icons';

// Ô nhập có icon trái + nút hiện/ẩn mật khẩu.
function AuthField({ label, icon, reveal, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-ink-muted">{label}</label>
            <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">{icon}</span>
                {children}
                {reveal && (
                    <button type="button" onClick={reveal.toggle} aria-label="Hiện/ẩn mật khẩu" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition hover:text-ink">
                        {reveal.shown ? <IconEyeOff /> : <IconEye />}
                    </button>
                )}
            </div>
        </div>
    );
}

// Màn đăng nhập / đăng ký. Form state cục bộ ở đây; App chỉ cấp callback & cờ.
//   onAuth(mode, { phone, pwd, confirm, name }) → có thể trả 'exists' để chuyển sang Đăng nhập.
export default function AuthScreen({ onAuth, onGoogle, loading, supabaseConfigured }) {
    const [phoneInput, setPhoneInput] = useState("");
    const [phonePass, setPhonePass] = useState("");
    const [authMode, setAuthMode] = useState("login"); // 'login' | 'register' — mặc định Đăng nhập
    const [authName, setAuthName] = useState("");
    const [authConfirmPass, setAuthConfirmPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const inp = "w-full rounded-2xl bg-cream-soft py-3.5 pl-11 pr-4 text-[14px] font-medium text-ink outline-none ring-1 ring-cream-deep transition placeholder:text-ink-faint focus:ring-2 focus:ring-orange";
    const inpPw = "w-full rounded-2xl bg-cream-soft py-3.5 pl-11 pr-11 text-[14px] font-medium text-ink outline-none ring-1 ring-cream-deep transition placeholder:text-ink-faint focus:ring-2 focus:ring-orange";

    const submit = async () => {
        const r = await onAuth(authMode, { phone: phoneInput, pwd: phonePass, confirm: authConfirmPass, name: authName });
        if (r === 'exists') setAuthMode('login');
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream p-4 font-sans dark:bg-[#0E0E0E] md:p-6">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange/20 blur-3xl dark:bg-[#89F336]/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-clay/20 blur-3xl dark:bg-[#22C55E]/10" />

            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] bg-surface shadow-[0_30px_80px_-20px_rgba(45,38,32,0.28)] ring-1 ring-cream-deep md:grid md:max-w-4xl md:grid-cols-2">
                {/* LEFT — welcome panel (desktop) */}
                <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-orange to-orange-deep p-10 text-white dark:from-[#16361f] dark:to-[#0a1f12] md:flex">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative">
                        <span className="text-3xl font-black italic tracking-tighter">STAYFIT</span>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Calorie &amp; Fitness</p>
                    </div>
                    <div className="relative">
                        <h2 className="text-[28px] font-black leading-tight tracking-tight">Chào mừng bạn 👋</h2>
                        <p className="mt-3 max-w-[28ch] text-[13px] leading-relaxed text-white/85">Theo dõi dinh dưỡng, cân nặng và giữ chuỗi ngày khoẻ mạnh — tất cả trong một nơi.</p>
                    </div>
                    <div className="relative flex items-center gap-2 text-[11px] font-medium text-white/75">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/80" /> Dữ liệu đồng bộ an toàn
                    </div>
                </div>

                {/* RIGHT — form */}
                <div className="p-7 sm:p-9">
                    <div className="mb-5 text-center md:hidden">
                        <span className="text-2xl font-black italic tracking-tighter text-orange-deep">STAYFIT</span>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-cream-soft p-1 ring-1 ring-cream-deep">
                        {[["register", "Đăng ký"], ["login", "Đăng nhập"]].map(([m, label]) => (
                            <button key={m} type="button" onClick={() => setAuthMode(m)} className={`rounded-full py-2.5 text-[12px] font-bold uppercase tracking-wide transition ${authMode === m ? "bg-surface text-orange-deep shadow-soft" : "text-ink-muted hover:text-ink"}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <h1 className="text-[22px] font-black tracking-tight text-ink">{authMode === "register" ? "Tạo tài khoản" : "Đăng nhập"}</h1>
                    <p className="mt-1 text-[12px] text-ink-muted">{authMode === "register" ? "Điền thông tin bên dưới để bắt đầu" : "Mừng bạn quay lại 👋"}</p>

                    {supabaseConfigured && (
                        <>
                            <button onClick={onGoogle} disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-cream-soft py-3.5 text-[13px] font-bold text-ink ring-1 ring-cream-deep transition hover:bg-cream-deep active:scale-[0.98] disabled:opacity-50">
                                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5.4 0 10.3-2 14-5.3l-6.5-5.5c-2 1.5-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5c-.5.4 7-5 7-15 0-1.2-.1-2.4-.4-3.5z"/></svg>
                                Tiếp tục với Google
                            </button>
                            <div className="my-5 flex items-center gap-3">
                                <div className="h-px flex-1 bg-cream-deep" /><span className="text-[10px] font-bold uppercase text-ink-faint">hoặc</span><div className="h-px flex-1 bg-cream-deep" />
                            </div>
                        </>
                    )}

                    <div className="space-y-3.5">
                        {authMode === "register" && (
                            <AuthField label="Họ và tên" icon={<IconUser />}>
                                <input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Tên của bạn" className={inp} />
                            </AuthField>
                        )}
                        <AuthField label="Số điện thoại" icon={<IconPhone />}>
                            <input type="tel" inputMode="numeric" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="VD: 0901234567" className={inp} />
                        </AuthField>
                        <AuthField label="Mật khẩu" icon={<IconLock />} reveal={{ shown: showPass, toggle: () => setShowPass(s => !s) }}>
                            <input type={showPass ? "text" : "password"} value={phonePass} onChange={e => setPhonePass(e.target.value)} placeholder="Tối thiểu 6 ký tự" className={inpPw} onKeyDown={e => { if (e.key === "Enter" && authMode === "login") submit(); }} />
                        </AuthField>
                        {authMode === "register" && (
                            <AuthField label="Xác nhận mật khẩu" icon={<IconLock />} reveal={{ shown: showConfirm, toggle: () => setShowConfirm(s => !s) }}>
                                <input type={showConfirm ? "text" : "password"} value={authConfirmPass} onChange={e => setAuthConfirmPass(e.target.value)} placeholder="Nhập lại mật khẩu" className={inpPw} onKeyDown={e => { if (e.key === "Enter") submit(); }} />
                            </AuthField>
                        )}
                    </div>

                    <button onClick={submit} disabled={loading} className="mt-6 w-full rounded-2xl bg-orange py-4 text-[14px] font-black uppercase tracking-widest text-onaccent shadow-[0_12px_24px_-8px_rgba(217,119,87,0.6)] transition active:scale-[0.98] disabled:opacity-50 dark:shadow-[0_12px_30px_-8px_rgba(34,197,94,0.5)]">
                        {loading ? "Đang kết nối..." : authMode === "register" ? "Tạo tài khoản" : "Đăng nhập"}
                    </button>

                    {authMode === "register" && (
                        <p className="mt-3 text-center text-[10px] leading-relaxed text-ink-faint">
                            Bằng việc đăng ký, bạn đồng ý với <span className="font-semibold text-ink-muted">Điều khoản dịch vụ</span> &amp; <span className="font-semibold text-ink-muted">Chính sách bảo mật</span>.
                        </p>
                    )}

                    <p className="mt-5 text-center text-[12px] text-ink-muted">
                        {authMode === "register" ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                        <button type="button" onClick={() => setAuthMode(authMode === "register" ? "login" : "register")} className="font-bold text-orange-deep hover:underline">
                            {authMode === "register" ? "Đăng nhập" : "Đăng ký"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
