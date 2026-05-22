import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #E89B7B 0%, #D97757 100%)',
          color: 'white',
          fontSize: 120,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
