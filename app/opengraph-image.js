import { ImageResponse } from 'next/og';

export const alt = 'StayFit — Nhật ký Calo & Sức khỏe';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 88px',
          background: '#FBF8F2',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: '#F7E8DC',
            opacity: 0.7,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: '#DDE7DC',
            opacity: 0.6,
            display: 'flex',
          }}
        />

        {/* Top — Logo + brand chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, zIndex: 1 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: 'linear-gradient(135deg, #E89B7B 0%, #D97757 100%)',
              color: 'white',
              fontSize: 52,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '-0.04em',
            }}
          >
            S
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#8C8378', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              stayfit.id.vn
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#2D2620', letterSpacing: '-0.02em', marginTop: 2 }}>
              StayFit
            </div>
          </div>
        </div>

        {/* Middle — headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: '#2D2620',
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Nhật ký Calo & </span>
            <span style={{ color: '#D97757' }}>Sức khỏe</span>
          </div>
          <div style={{ fontSize: 30, color: '#8C8378', fontWeight: 500, letterSpacing: '-0.01em' }}>
            Theo dõi dinh dưỡng mỗi ngày · Đồng bộ điện thoại ↔ máy tính
          </div>
        </div>

        {/* Bottom — stat pills */}
        <div style={{ display: 'flex', gap: 16, zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 999,
              background: 'white',
              border: '1px solid #EBE3D2',
              fontSize: 22,
              fontWeight: 600,
              color: '#2D2620',
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#5F8266', display: 'flex' }} />
            Protein
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 999,
              background: 'white',
              border: '1px solid #EBE3D2',
              fontSize: 22,
              fontWeight: 600,
              color: '#2D2620',
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#C49A4A', display: 'flex' }} />
            Carbs
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 999,
              background: 'white',
              border: '1px solid #EBE3D2',
              fontSize: 22,
              fontWeight: 600,
              color: '#2D2620',
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#9B8AB8', display: 'flex' }} />
            Fat
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 999,
              background: '#D97757',
              color: 'white',
              fontSize: 22,
              fontWeight: 700,
              marginLeft: 'auto',
            }}
          >
            stayfit.id.vn
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
