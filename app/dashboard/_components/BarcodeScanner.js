'use client';

import { useEffect, useRef, useState } from 'react';

// Quét mã vạch/QR trực tiếp từ camera. Dùng @zxing/browser (chạy được trên iOS Safari,
// nơi BarcodeDetector API không có sẵn). Thư viện được import động → chỉ tải khi mở scanner.
export default function BarcodeScanner({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;

  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const { DecodeHintType, BarcodeFormat } = await import('@zxing/library');

        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE,
        ]);

        const reader = new BrowserMultiFormatReader(hints);
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (result, _err, ctrl) => {
            if (cancelled || !result) return;
            ctrl.stop();
            onDetectRef.current(result.getText());
          }
        );
        controlsRef.current = controls;
        if (cancelled) controls.stop();
      } catch (e) {
        if (cancelled) return;
        setError(
          e?.name === 'NotAllowedError'
            ? 'Bạn cần cho phép truy cập camera để quét mã.'
            : 'Không mở được camera. Hãy kiểm tra quyền camera rồi thử lại.'
        );
      }
    })();

    return () => {
      cancelled = true;
      try { controlsRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/70 to-transparent">
        <span className="text-white text-[15px] font-bold tracking-tight">Quét mã vạch</span>
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white active:scale-95 transition" aria-label="Đóng">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />

      {/* Khung ngắm */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-40 rounded-2xl border-2 border-white/85 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
      </div>
      <p className="absolute bottom-12 inset-x-0 px-8 text-center text-white/90 text-[13px] font-medium pointer-events-none">
        Đưa mã vạch sản phẩm vào trong khung
      </p>

      {error && (
        <div className="absolute inset-0 z-20 bg-black/85 flex flex-col items-center justify-center gap-5 px-10 text-center">
          <p className="text-white text-[14px] leading-relaxed">{error}</p>
          <button onClick={onClose} className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-[13px] active:scale-95 transition">Đóng</button>
        </div>
      )}
    </div>
  );
}
