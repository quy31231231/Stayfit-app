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
  themeColor: '#FFFFFF',
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
                      // Apple-aligned tokens (remapped to existing names to keep layout intact)
                      // cream → canvas/parchment/hairline (white surfaces)
                      cream:  { DEFAULT: '#FFFFFF', soft: '#F5F5F7', deep: '#E0E0E0' },
                      // ink → Apple ink hierarchy
                      ink:    { DEFAULT: '#1D1D1F', muted: '#6E6E73', faint: '#86868B' },
                      // orange → Action Blue (single brand accent)
                      orange: { DEFAULT: '#0066CC', soft: '#F5F5F7', deep: '#0071E3' },
                      // Macro distinguishers (kept distinct but slightly muted toward Apple aesthetic)
                      clay:   { DEFAULT: '#A87B3F', soft: '#F5F5F7', deep: '#6B4F1A' },
                      sage:   { DEFAULT: '#4F7155', soft: '#F5F5F7', deep: '#2D4632' },
                      lilac:  { DEFAULT: '#7E70A0', soft: '#F5F5F7', deep: '#3F2F5C' },
                      mist:   { DEFAULT: '#5C7E94', soft: '#F5F5F7', deep: '#3D5A6B' },
                    },
                    fontFamily: {
                      sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'SF Pro Display', 'Inter', 'sans-serif'],
                    },
                    boxShadow: {
                      // Apple uses NO shadows on UI — only one product shadow on hero imagery
                      soft: 'none',
                      lift: 'none',
                      ring: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
                      // single product shadow reserved for calorie ring / hero
                      product: 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0',
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
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Inter', sans-serif;
            font-feature-settings: 'cv11', 'ss01', 'ss03';
            letter-spacing: -0.01em;
            -webkit-tap-highlight-color: transparent;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: #FFFFFF;
            color: #1D1D1F;
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
