import { Analytics } from '@vercel/analytics/next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata = {
  metadataBase: new URL('https://stayfit.id.vn'),
  applicationName: 'StayFit',
  title: {
    default: 'StayFit · Nhật ký Calo & Sức khỏe',
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
    title: 'StayFit · Nhật ký Calo & Sức khỏe',
    description: 'Theo dõi calo, dinh dưỡng và cân nặng mỗi ngày. Đồng bộ liền mạch giữa điện thoại và máy tính.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'StayFit · Nhật ký Calo & Sức khỏe',
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
  colorScheme: 'light dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={jakarta.variable}>
      <head>
        {/* Chống FOUC: set class `dark` trước khi paint nếu user đã chọn tối */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('stayfit_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-cream text-ink">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
