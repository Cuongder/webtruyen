# Mộc Thư – Nền tảng Đọc & Sáng tác Truyện chữ Mobile First

**Mộc Thư** là nền tảng web hiện đại dành riêng cho độc giả và tác giả yêu thích truyện chữ tiếng Việt, được thiết kế theo tư duy **Mobile First** chuẩn mực (tối ưu hóa từ màn hình 320px đến 430px trên điện thoại trước khi mở rộng lên Tablet và Desktop).

Hệ thống kết hợp phong cách thẩm mỹ trầm ấm, cổ điển của những thư viện tư gia danh giá với công nghệ số hiện đại, giúp người đọc thư giãn tối đa trong nhiều giờ mà không bị lóa mắt hay mỏi mệt.

---

## 🌟 Tính năng Nổi bật

### 1. Trải nghiệm Độc giả (Mobile Reader Engine)
- **3 Chế độ nền (Theme)**: Mộc Tối (Warm Dark `#14110F`), Giấy Cũ (Parchment Sepia `#F4ECE1`), Ban Ngày (Soft Ivory `#FAF7F2`).
- **Tùy biến Typography sâu**: Chọn phông chữ (`Literata` serif cổ điển hoặc `Be Vietnam Pro` sắc nét), điều chỉnh cỡ chữ từ 14px đến 26px, giãn dòng và độ rộng lề qua Bottom Sheet tiện tay với ngón cái.
- **Chế độ Đọc tập trung (Zen Mode)**: Tự động ẩn thanh điều hướng trên và dưới khi cuộn đọc xuống, chạm 1 chạm để gọi lại HUD.
- **Thanh đo tiến độ 2px**: Hiển thị % chương đã đọc ngay mép dưới màn hình.
- **Tự động lưu tiến độ đọc**: Ghi nhớ chương và vị trí cuộn gần nhất.

### 2. Trải nghiệm Tác giả (Author Studio)
- **Tối ưu hóa Bàn phím ảo di động**: Thanh công cụ soạn thảo neo theo `window.visualViewport`, không bị bàn phím ảo che khuất con trỏ văn bản.
- **Bộ đệm Bản thảo Đa tầng (Multi-tier Draft Guard)**: Lưu tức thời vào `localStorage` mỗi 300ms + debounce autosave lên máy chủ. Tự động phát hiện và cung cấp nút khôi phục 1 chạm nếu bị tắt tab đột ngột hoặc rớt mạng 4G.
- **Bộ phím tắt văn học**: Chèn nhanh dấu ngoặc kép đối thoại tiếng Việt (“ ”), dấu ba chấm (…), gạch đầu dòng thoại (—) và thụt lề đoạn văn.
- **Đếm từ & thời gian đọc**: Đo lường chuẩn xác từ ngữ tiếng Việt theo thời gian thực.

### 3. Tủ Sách Đa Ngăn (Smart Shelves)
- Phân loại rõ ràng: *Đang đọc dở* (kèm thanh % tiến độ và nút Đọc tiếp 1-click), *Theo dõi*, *Yêu thích*, và *Đã đọc*.

### 4. Quản trị & Kiểm duyệt (Admin Moderation)
- Giao diện quản trị dạng thẻ thân thiện với màn hình điện thoại và máy tính bảng.
- Xử lý báo cáo vi phạm, kiểm duyệt tác phẩm, giám sát bình luận và nhật ký kiểm toán (Audit Logs).

---

## 🛠️ Công nghệ Sử dụng

- **Frontend & Fullstack Framework**: Next.js 15+ (App Router), React 19, TypeScript (Strict Mode).
- **Styling & Design System**: Tailwind CSS, Google Stitch MCP Design Tokens, Lucide Icons.
- **Cơ sở dữ liệu & ORM**: PostgreSQL, Prisma ORM.
- **Xác thực & Bảo mật**: HTTP-only Session Cookie, mã hóa mật khẩu `bcryptjs`, phân quyền RBAC đa cấp (`READER`, `AUTHOR`, `ADMIN`).

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Thiết lập biến môi trường
Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```
Cấu hình chuỗi kết nối PostgreSQL tại `DATABASE_URL`.

### 3. Sinh Prisma Client & Đồng bộ CSDL
```bash
npx prisma generate
npx prisma db push
```

### 4. Nạp dữ liệu mẫu tiếng Việt (Seed Data)
```bash
npm run prisma:seed
```

### 5. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 👥 Tài khoản Trải nghiệm Mẫu (Demo Accounts)

Hệ thống tích hợp sẵn các tài khoản thử nghiệm trên giao diện Đăng nhập:

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Độc giả** | `reader@mocthu.vn` | `reader123` | Đọc truyện, lưu tủ sách, đánh dấu trang, bình luận |
| **Tác giả** | `author@mocthu.vn` | `author123` | Toàn quyền độc giả + Author Studio, tạo truyện, viết chương |
| **Quản trị** | `admin@mocthu.vn` | `admin123` | Toàn quyền hệ thống + Bảng điều khiển Admin kiểm duyệt |

---

## 📱 Kiểm thử Viewport Mobile First

Hệ thống được kiểm thử đạt chuẩn hiển thị trên:
- **Mobile nhỏ**: 320px – 374px (iPhone SE, Galaxy A series)
- **Mobile tiêu chuẩn**: 375px – 430px (iPhone 13/14/15/Pro Max)
- **Tablet**: 768px – 1024px (iPad Mini, iPad Air)
- **Desktop**: 1280px – 1920px (Laptop, PC)
