# NHẬT KÝ QUYẾT ĐỊNH THIẾT KẾ & KIẾN TRÚC (DECISIONS.md)

Dự án: **Mộc Thư – Nền tảng Đọc & Sáng tác Truyện chữ Mobile First**

---

### [DECISION-001] Thiết kế Mobile First làm kim chỉ nam phát triển
- **Bối cảnh**: Hơn 85% người đọc truyện chữ tại Việt Nam sử dụng smartphone (iOS/Android). Thiết kế desktop-first rồi thu nhỏ sẽ tạo ra trải nghiệm tồi tệ: font chữ quá nhỏ, menu quá dày đặc, bảng dữ liệu bị tràn và thao tác ngón cái bất tiện.
- **Quyết định**: Xây dựng toàn bộ giao diện từ màn hình Mobile nhỏ (320px) đến Mobile chuẩn (375-430px) trước. Mọi thành phần tương tác (Bottom Navigation, Bottom Sheets, Card view, Sticky Read CTA) được sinh ra dành riêng cho Mobile. Tablet và Desktop là sự mở rộng tuần tự theo lưới hiển thị.
- **Hệ quả**: Code CSS dùng base style cho mobile, sau đó dùng `md:` và `lg:` để mở rộng.

---

### [DECISION-002] Tích hợp Google Stitch MCP và lựa chọn phương án Trang chủ
- **Bối cảnh**: Cần có định hướng trực quan thẩm mỹ cao cấp, trầm ấm, mang phong vị văn học trước khi viết code.
- **Quyết định**:
  - Khởi tạo project `Mộc Thư – Reading & Writing Platform` (ID: `18340681401478326884`) trên Stitch MCP.
  - Thiết lập Design System với bảng màu Espresso sẫm `#14110F`, than ấm `#1C1714`, vàng hổ phách `#D39A5B`, kem giấy `#F2E8DC`.
  - Sinh 2 phương án Mobile Home. Đã tổng hợp thế mạnh của cả 2: giữ lại khối "Tiếp tục đọc dở dang" có thanh tiến độ % của Phương án 1 và nét biên tập tinh hoa, bảng vàng `01`, `02`, `03` mạ vàng và tìm kiếm nhanh của Phương án 2.

---

### [DECISION-003] Lựa chọn Tech Stack: Next.js 15+ App Router, TypeScript & Prisma ORM
- **Bối cảnh**: Cần một hệ thống production-ready, SEO tối ưu cho hàng vạn trang truyện, Server-side rendering nhanh, bảo mật phân quyền máy chủ.
- **Quyết định**:
  - Frontend & Backend: Next.js 15 (App Router) với React Server Components (RSC) và Server Actions.
  - Ngôn ngữ: TypeScript strict mode.
  - Styling: Tailwind CSS với CSS variables tương thích DESIGN.md.
  - Database & ORM: PostgreSQL quan hệ chuẩn mực kết hợp Prisma ORM. Hỗ trợ chạy local/remote qua biến môi trường `DATABASE_URL`.
  - Auth: Xác thực phiên Session bảo mật HTTP-only Cookie, mật khẩu mã hóa bcrypt, phân quyền RBAC đa cấp (Reader, Author, Admin).

---

### [DECISION-004] Bộ đệm Bản thảo Đa tầng (Multi-tier Draft Guard) cho Chapter Editor
- **Bối cảnh**: Tác giả sáng tác trên điện thoại rất dễ mất bản thảo do rớt mạng 4G, chuyển đổi ứng dụng, hoặc vô tình đóng tab.
- **Quyết định**:
  - Tầng 1: Lưu cục bộ tức thời vào `localStorage` mỗi 300ms.
  - Tầng 2: Debounce 1.5s gửi bản lưu nháp lên server qua Server Action.
  - Tầng 3: Tự động phát hiện phiên bản lưu cục bộ mới hơn máy chủ khi mở lại editor để cung cấp nút khôi phục 1 chạm.
  - Bàn phím ảo: Tích hợp `window.visualViewport` để thanh công cụ gõ luôn neo ngay sát mép bàn phím ảo mà không che khuất con trỏ văn bản.

---

### [DECISION-005] Động cơ Đọc Sách Chống Phân Tâm (Zen Reader Engine)
- **Bối cảnh**: Đọc truyện chữ đòi hỏi sự tập trung và chống mỏi mắt trong hàng giờ liền.
- **Quyết định**:
  - Thanh điều hướng trên và thanh công cụ đáy tự động ẩn khi người đọc cuộn xuống đọc liên tục và hiện lại khi chạm 1 lần vào giữa màn hình.
  - Hỗ trợ 3 theme: Mộc Tối (Warm Dark), Giấy Cũ (Sepia), Ban Ngày (Soft Ivory).
  - Tùy biến cỡ chữ, khoảng cách dòng, độ rộng lề qua Bottom Sheet.
  - Tự động lưu tiến độ đọc (chương + % cuộn) với cơ chế debounce, giúp người đọc quay lại đúng vị trí dở dang.

---

### [DECISION-006] Cơ chế Đếm Lượt xem Chống Gian Lận (Anti-Abuse Engagement Counter)
- **Bối cảnh**: Tránh trường hợp bot hoặc người dùng refresh trang liên tục để tăng ảo lượt view của truyện.
- **Quyết định**: Chỉ tính 1 lượt xem hợp lệ khi độc giả dừng lại ở chương tối thiểu 20 giây và cuộn qua ít nhất 40% độ dài chương. Giới hạn 1 view / chương / IP / 30 phút.
