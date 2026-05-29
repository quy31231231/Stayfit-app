export default function manifest() {
  return {
    name: 'StayFit · Nhật ký Calo & Sức khỏe',
    short_name: 'StayFit',
    description: 'Theo dõi calo, dinh dưỡng và cân nặng mỗi ngày.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FBF8F2',
    theme_color: '#FBF8F2',
    lang: 'vi-VN',
    dir: 'ltr',
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-maskable.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Nhật ký hôm nay',
        short_name: 'Nhật ký',
        description: 'Mở nhật ký ăn uống hôm nay',
        url: '/',
        icons: [{ src: '/icon.svg', sizes: 'any' }],
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Tổng quan dinh dưỡng',
        url: '/dashboard',
        icons: [{ src: '/icon.svg', sizes: 'any' }],
      },
    ],
  };
}
