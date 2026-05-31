'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

// Cắt ảnh theo vùng (pixel) đã chọn → trả Blob JPEG vuông.
async function getCroppedBlob(src, area) {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  canvas.getContext('2d').drawImage(
    img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height
  );
  return new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
}

export default function AvatarCropper({ src, busy = false, onCancel, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, area) => setAreaPixels(area), []);

  const confirm = async () => {
    if (!areaPixels || busy) return;
    const blob = await getCroppedBlob(src, areaPixels);
    onComplete(blob);
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-ink max-w-md mx-auto">
      <div className="px-5 pt-6 pb-2 text-center">
        <p className="text-[15px] font-bold text-white">Cắt ảnh đại diện</p>
        <p className="mt-0.5 text-[11px] text-white/60">Kéo để di chuyển · chụm/thanh trượt để phóng to</p>
      </div>

      <div className="relative flex-1">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="rect"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="px-6 pb-8 pt-4 space-y-4 bg-ink">
        <input
          type="range" min={1} max={3} step={0.01} value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-orange"
          aria-label="Phóng to"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel} disabled={busy}
            className="px-5 py-3.5 rounded-2xl bg-white/10 text-white font-semibold text-[13px] hover:bg-white/15 transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={confirm} disabled={busy}
            className="flex-1 py-3.5 rounded-2xl bg-orange text-white font-bold text-[14px] hover:bg-orange-deep active:scale-95 transition disabled:opacity-60"
          >
            {busy ? 'Đang lưu…' : 'Xong'}
          </button>
        </div>
      </div>
    </div>
  );
}
