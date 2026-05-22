import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  metadataBase: new URL('https://stayfit.id.vn'),
  applicationName: 'StayFit',
  title: {
    default: 'StayFit — Nhật ký Calo & Sức khỏe',
    template: '%s · StayFit',
  },
  description: 'Theo dõi calo, dinh dưỡng và cân nặng mỗi ngày. Đồng bộ liền mạch giữa điện thoại và máy tính qua Google Sheets.',
  keywords: ['calo', 'kcal', 'dinh dưỡng', 'macro', 'protein', 'sức khỏe', 'giảm cân', 'fitness', 'BMR', 'TDEE'],
  authors: [{ name: 'Cao Mạnh Quý' }],
  creator: 'Cao Mạnh Quý',
  publisher: 'StayFit',

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://stayfit.id.vn',
    siteName: 'StayFit',
    title: 'StayFit — Nhật ký Calo & Sức khỏe',
    description: 'Theo dõi calo, dinh dưỡng và cân nặng mỗi ngày. Đồng bộ liền mạch giữa điện thoại và máy tính.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'StayFit — Nhật ký Calo & Sức khỏe',
    description: 'Theo dõi calo, dinh dưỡng và cân nặng mỗi ngày.',
  },

  appleWebApp: {
    capable: true,
    title: 'StayFit',
    statusBarStyle: 'default',
  },

  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const viewport = {
  themeColor: '#FBF8F2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      cream:  { DEFAULT: '#FBF8F2', soft: '#F4EFE6', deep: '#EBE3D2' },
                      ink:    { DEFAULT: '#2D2620', muted: '#7A7066', faint: '#B8AFA4' },
                      orange: { DEFAULT: '#D97757', soft: '#F7E8DC', deep: '#7A3318' },
                      clay:   { DEFAULT: '#C49A4A', soft: '#F0E5CC', deep: '#5C4015' },
                      sage:   { DEFAULT: '#5F8266', soft: '#DDE7DC', deep: '#2D4632' },
                      lilac:  { DEFAULT: '#9B8AB8', soft: '#E5DDED', deep: '#3F2F5C' },
                      mist:   { DEFAULT: '#6B95AB', soft: '#DDE8EF', deep: '#3D5A6B' },
                    },
                    fontFamily: {
                      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                    },
                    boxShadow: {
                      soft: '0 1px 2px rgba(45, 38, 32, 0.04), 0 8px 24px -12px rgba(45, 38, 32, 0.08)',
                      lift: '0 4px 12px -4px rgba(45, 38, 32, 0.12), 0 16px 40px -16px rgba(45, 38, 32, 0.20)',
                      ring: 'inset 0 0 0 1px rgba(45, 38, 32, 0.06)',
                    },
                  },
                },
              };
            `,
          }}
        />

        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <style>{`
          body {
            font-family: 'Inter', sans-serif;
            font-feature-settings: 'cv11', 'ss01', 'ss03';
            letter-spacing: -0.011em;
            -webkit-tap-highlight-color: transparent;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: #FBF8F2;
            color: #2D2620;
            overscroll-behavior-y: contain;
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none; margin: 0;
          }

          @keyframes gentle-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50%      { transform: scale(1.04); opacity: 0.95; }
          }
          .animate-gentle-pulse { animation: gentle-pulse 4s ease-in-out infinite; }

          @keyframes fade-rise {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-rise { animation: fade-rise 0.5s ease-out backwards; }

          *:focus-visible {
            outline: 2px solid #D97757;
            outline-offset: 2px;
            border-radius: 4px;
          }

          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}</style>
      </head>

      <body className="bg-cream text-ink">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
