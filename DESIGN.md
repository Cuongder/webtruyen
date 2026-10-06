# MỘC THƯ – DESIGN SYSTEM & UI SPECIFICATION (DESIGN.md)

Tài liệu này là nguồn chuẩn mực giao diện (Single Source of Truth) cho toàn bộ hệ thống web đọc & sáng tác truyện chữ **Mộc Thư**.

---

## 1. Triết lý Thiết kế (Design Philosophy)

- **Trầm ấm – Cao cấp – Văn học – Thư giãn**: Lấy cảm hứng từ những phòng đọc sách tư gia cổ điển kết hợp công nghệ đọc kỹ thuật số hiện đại.
- **Mobile First là nguyên tắc bất biến**: Giao diện và tương tác được tối ưu triệt để cho màn hình điện thoại (320px – 430px) trước khi mở rộng lên Tablet và Desktop.
- **Chống mỏi mắt (Anti-glare & Eye Endurance)**: Loại bỏ màu đen tuyệt đối (#000000) và trắng chói (#FFFFFF). Sử dụng tông nâu khói Espresso, than củi ấm, hổ phách dịu dàng và chữ màu kem ngà.
- **Tập trung vào câu chữ (Content-First & Zen Experience)**: Khu vực đọc được giản lược tối đa chrome/menu khi cuộn, nhường trọn vẹn không gian cho tác phẩm.

---

## 2. Hệ Thống Màu Sắc (Color Tokens)

### 2.1 Bảng Màu Cốt Lõi (Core Dark Palette)
| Token Name | Hex Code | Tên màu | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| `background` | `#14110F` | Espresso Base | Nền chính toàn bộ trang, chống lóa mắt ban đêm |
| `surface` | `#1C1714` | Warm Charcoal | Thẻ truyện, danh sách, thanh điều hướng đáy, header |
| `surface-elevated` | `#261E19` | Roast Umber | Thẻ nổi, modal, bottom sheet, menu popover |
| `primary` | `#D39A5B` | Amber Gold | Nút bấm chính, huy hiệu nổi bật, icon active, thanh tiến độ |
| `primary-hover` | `#B87F42` | Deep Amber | Trạng thái hover/active của nút chính |
| `secondary` | `#E7C9A5` | Soft Cream | Nút phụ (Ghost button), viền thẻ danh dự, trích dẫn |
| `tertiary` | `#8C5A2B` | Burnt Terracotta | Huy hiệu phụ, viền tag phân loại, thanh phân cách |
| `text-primary` | `#F2E8DC` | Warm Ivory | Tiêu đề, nội dung đọc chính, chữ có độ tương phản cao |
| `text-secondary`| `#9D8C7C` | Muted Taupe | Tác giả, số chương, lượt đọc, nhãn phụ, ngày cập nhật |
| `text-muted` | `#6E5F52` | Faded Wood | Chú thích chân trang, placeholder tìm kiếm |
| `border` | `#2C241E` | Muted Sepia Rule | Đường viền 1px tinh tế giữa các khối |
| `border-accent` | `#453324` | Warm Edge | Viền sáng nhẹ khi focus ô nhập liệu |

### 2.2 Ba Chế Độ Nền Trình Đọc (Reader Themes)
1. **Mộc Tối (Warm Dark)**:
   - Nền: `#14110F` | Chữ: `#F2E8DC` | Thẻ công cụ: `#1C1714`
2. **Giấy Cũ (Parchment Sepia)**:
   - Nền: `#F4ECE1` | Chữ: `#2D2319` | Thẻ công cụ: `#E8DECة`
3. **Ban Ngày (Soft Ivory Light)**:
   - Nền: `#FAF7F2` | Chữ: `#1C1714` | Thẻ công cụ: `#EEE9E0`

---

## 3. Hệ Thống Kiểu Chữ (Typography System)

### 3.1 Phông chữ (Font Families)
- **UI Font**: `Be Vietnam Pro`, system-ui, sans-serif (Tối ưu 100% dấu tiếng Việt sắc nét, rõ ràng ở kích thước nhỏ).
- **Reading Font**: `Literata`, `Merriweather`, serif (Chuyên biệt cho đọc truyện dài, độ cao chữ x-height chuẩn, không mỏi mắt).
- **Editorial Heading**: `Playfair Display`, serif (Tiêu đề tác phẩm tâm điểm, số thứ tự mạ vàng 01-05).

### 3.2 Thang kích thước Typography
| Cấp bậc | Font Size | Line Height | Phông đề xuất | Trọng lượng |
| :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 32px (2rem) | 1.25 | Playfair / Be Vietnam | Bold (700) |
| `headline-lg`| 24px (1.5rem)| 1.3 | Playfair / Be Vietnam | SemiBold (600) |
| `headline-md`| 20px (1.25rem)| 1.35| Be Vietnam Pro | SemiBold (600) |
| `headline-sm`| 18px (1.125rem)| 1.4| Be Vietnam Pro | Medium (500) |
| `body-reading`| 18px (1.125rem)| 1.85| Literata | Regular (400) |
| `body-ui` | 15px (0.9375rem)| 1.5 | Be Vietnam Pro | Regular (400) |
| `label-md` | 13px (0.8125rem)| 1.3 | Be Vietnam Pro | Medium (500) |
| `caption-sm` | 11px (0.6875rem)| 1.2 | Be Vietnam Pro | Regular (400) |

---

## 4. Breakpoint & Lưới Bố Cục (Responsive Grid & Breakpoints)

| Tên Breakpoint | Dải Viewport | Hành vi Layout |
| :--- | :--- | :--- |
| **Mobile nhỏ** | 320px – 374px | 1 cột duy nhất, lề 12px, font đọc thu gọn 16px, ẩn metadata phụ |
| **Mobile chuẩn** | 375px – 430px | 1 cột, lề 16px, font đọc chuẩn 18px, Bottom Navigation 5 tab |
| **Mobile lớn** | 431px – 599px | 1 cột thoáng, thẻ truyện dạng cuộn ngang snap mượt mà |
| **Tablet** | 600px – 1023px | 2–3 cột lưới truyện, lề 24px, drawer điều hướng mở rộng |
| **Laptop / PC** | 1024px – 1439px | 4–5 cột lưới truyện, Header đầy đủ, Reader giới hạn max-width `46rem` (736px) |
| **Desktop lớn** | 1440px+ | Giới hạn container max 1280px, cân đối khoảng trắng hai bên |

---

## 5. Quy Chuẩn Tương Tác Di Động (Mobile Ergonomics)

- **Touch Target**: Tối thiểu `44×44px` (ưu tiên `48×48px`) cho tất cả các nút hành động chính, tab điều hướng, nút chuyển chương.
- **Khu vực ngón tay cái (Thumb Reach)**:
  - Các nút hành động chính (Đọc tiếp, Lưu tủ sách, Cài đặt đọc, Đăng chương) luôn nằm ở nửa dưới màn hình hoặc Sticky Bottom Bar.
- **Safe Area Inset**:
  - `padding-bottom: max(16px, env(safe-area-inset-bottom))` cho Bottom Bar và Sticky Footer.
  - `padding-top: max(12px, env(safe-area-inset-top))` cho Top Header.
- **Bàn phím ảo di động (Virtual Keyboard Adaptation)**:
  - Thanh công cụ soạn thảo neo theo `window.visualViewport` để không bị bàn phím che khuất vùng nhập liệu.

---

## 6. Thành Phần Tái Sử Dụng (Core Component Specifications)

1. **MobileHeader (`h-14` / 56px)**: Logo Mộc Thư, nút Tìm kiếm, Chuông thông báo (kèm badge chấm đỏ), Avatar người dùng.
2. **BottomNavigation (`h-16` / 64px + safe-area)**: 5 Tab [Trang chủ, Khám phá, Tủ sách, Thông báo, Cá nhân]. Icon kích thước 22px, nhãn 11px, hiệu ứng chạm nổi bật.
3. **StoryCardMobile**:
   - Tỉ lệ bìa sách chuẩn: `3:4` (ví dụ `72×96px` cho danh sách, `120×160px` cho thẻ nổi bật).
   - Tên truyện tối đa 2 dòng, tác giả 1 dòng, số chương và tag thể loại.
4. **StickyReadCTA**: Thanh neo đáy tại trang Chi tiết truyện: Nút to "Đọc từ đầu" / "Đọc tiếp Chương X" và nút "Thêm vào Tủ sách".
5. **ReaderHUD**: Thanh trên và thanh đáy điều khiển đọc sách tự ẩn khi người dùng cuộn xuống đọc và hiện lại khi chạm 1 lần vào màn hình.
6. **BottomSheet**: Bảng trượt từ đáy lên dành cho: Bộ lọc thể loại, Tùy chỉnh cỡ chữ / theme, Danh sách mục lục chương.

---

## 7. Cấu Hình Biến CSS (Tailwind Integration)

```css
:root {
  --bg-base: #14110F;
  --surface-base: #1C1714;
  --surface-elevated: #261E19;
  --color-primary: #D39A5B;
  --color-primary-hover: #B87F42;
  --color-secondary: #E7C9A5;
  --color-tertiary: #8C5A2B;
  --text-main: #F2E8DC;
  --text-sub: #9D8C7C;
  --text-faint: #6E5F52;
  --border-subtle: #2C241E;
  --border-accent: #453324;
}
```
