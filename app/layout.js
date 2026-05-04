export const metadata = {
  title: 'StayFit - Nhật ký Calo & Thống kê',
  description: 'Ứng dụng theo dõi sức khỏe StayFit',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        {/* Nhúng giao diện Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Nhúng Font chữ Inter */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet" />
        
        {/* Các CSS tùy chỉnh ẩn thanh cuộn */}
        <style>{`
          body { 
            font-family: 'Inter', sans-serif; 
            -webkit-tap-highlight-color: transparent; 
          }
          .no-scrollbar::-webkit-scrollbar { 
            display: none; 
          }
          .no-scrollbar { 
            -ms-overflow-style: none; 
            scrollbar-width: none; 
          }
          input[type=number]::-webkit-inner-spin-button, 
          input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
        `}</style>
      </head>
      
      <body className="bg-slate-50">
        {children}
      </body>
    </html>
  )
}