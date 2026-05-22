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
                      cream: { DEFAULT: '#FDFBF7', soft: '#F6F1E7', deep: '#EDE5D3' },
                      ink:   { DEFAULT: '#3D3935', muted: '#8B847D', faint: '#B8B2AB' },
                      orange:{ DEFAULT: '#F2A65A', soft: '#FBE0C4', deep: '#D4853F' },
                      clay:  { DEFAULT: '#E8C892', soft: '#F7EAD1', deep: '#C9A766' },
                      sage:  { DEFAULT: '#A8C09A', soft: '#DCEAD3', deep: '#769566' },
                      lilac: { DEFAULT: '#C8B6E2', soft: '#EBE3F5', deep: '#9A82C2' },
                    },
                    fontFamily: {
                      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                    },
                    boxShadow: {
                      soft: '0 4px 24px -8px rgba(60, 50, 40, 0.08)',
                      lift: '0 12px 40px -12px rgba(60, 50, 40, 0.18)',
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
            -webkit-tap-highlight-color: transparent;
            background-color: #FDFBF7;
            color: #3D3935;
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
