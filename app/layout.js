export const metadata = {
  title: 'StayFit - Nhật ký Calo & Thống kê',
  description: 'Ứng dụng theo dõi sức khỏe StayFit',
}

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
                      ink:    { DEFAULT: '#2D2620', muted: '#8C8378', faint: '#B8AFA4' },
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
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none; margin: 0;
          }
        `}</style>
      </head>

      <body className="bg-cream text-ink">
        {children}
      </body>
    </html>
  )
}
