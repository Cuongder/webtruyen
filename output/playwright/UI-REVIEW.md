# Đánh giá mã nguồn và giao diện Mộc Thư

Ngày đánh giá: 04/10/2026. Website kiểm tra: http://localhost:3000.

Cập nhật: đã sửa header responsive trên Studio và các trang dùng chung header; kiểm tra trực tiếp từ 320px đến 1440px không còn phần tử header vượt khung. Chi tiết lần sửa và ảnh mới ở cuối báo cáo.

## Phạm vi

- Đã đọc toàn bộ 39 file trong `src` và `prisma`, tổng cộng 5.408 dòng, cùng README, DESIGN, DECISIONS và các file cấu hình. Không tính thư viện trong node_modules, mã sinh trong .next và nội dung máy sinh của package-lock là mã ứng dụng.
- Một subagent thực hiện kiểm tra bằng trình duyệt; agent chính đối chiếu với mã nguồn, HTTP và ảnh chụp. Playwright CLI gặp lỗi Chrome `Target crashed`; việc kiểm tra giao diện tiếp tục bằng trình duyệt IAB.
- Viewport chính: desktop 1440×900 và rộng 1024px, tablet rộng 768px, điện thoại rộng 390px và 320px.
- Phần khảo sát ban đầu được thực hiện trước khi sửa mã. Lần sửa header tiếp theo được ghi riêng ở cuối báo cáo.

## Tổng quan codebase

Next.js App Router, React, TypeScript, Tailwind, Lucide; cấu hình Prisma/PostgreSQL và phiên đăng nhập JWT trong cookie HTTP-only. Package khai báo Next ^15.2.1; bản cài đặt hiện tại là 15.5.27.

Có 17 page entry, một route API xác thực, các component điều hướng, thẻ truyện, trình đọc và trình soạn chương. `src/lib/data-store.ts` cung cấp sáu truyện nhưng chỉ một truyện có ba chương mẫu. Các trang đang dùng dữ liệu tĩnh này; Prisma schema và seed chưa trở thành lớp dữ liệu của các luồng sản phẩm.

## Đánh giá thiết kế

Tông nâu ấm và vàng hổ phách nhất quán với DESIGN.md. Trang chủ desktop có thứ bậc nội dung rõ; hero, thẻ truyện và danh sách tạo được cảm giác một không gian đọc sách. Trình đọc trực tiếp hoạt động với nền tối và nền sáng; chữ nội dung có khoảng cách tương đối thoáng.

Tuy nhiên, lỗi trang và điều hướng hiện ngắt các luồng sử dụng cốt lõi. Responsive chưa ổn định ở tablet và điện thoại nhỏ. Nhiều nhãn phụ chỉ 10–11px, màu quá mờ. Một số bìa ảnh stock không gợi đúng nội dung truyện, ví dụ bìa Cửu Tinh Vô Cực là tay cầm chơi game.

## Các vấn đề ưu tiên

### 1. P1 — Trang chi tiết truyện và trang tác giả bị lỗi ứng dụng

- `/story/truong-khach-son-ha`: HTTP 500. Bấm “Chi tiết” trên trang chủ dẫn tới toàn trang “Application error”; trình duyệt ghi nhận lỗi render Server Components.
- `/author/author-1`: HTTP 500; trình duyệt cũng xác nhận toàn trang lỗi server.
- Trong mã, hai page là async Server Components nhưng truyền hàm `onClick` trực tiếp cho button. Cần tách phần tương tác thành Client Component hoặc dùng action phù hợp.
- Vị trí: `src/app/story/[slug]/page.tsx:303`, `src/app/author/[username]/page.tsx:76`.
- Ảnh: [Lỗi trang truyện](D:/Vibecode/webtruyen/output/playwright/story-runtime-error.jpg), [Lỗi trang tác giả](D:/Vibecode/webtruyen/output/playwright/author-runtime-error.jpg).

### 2. P1 — Header vỡ bố cục ở tablet (đã sửa)

- Tại 768px, logo bị xuống dòng, tagline bị bóp thành một cột chữ tràn khỏi header và khu vực tìm kiếm xuống nhiều dòng.
- Tại 1024px sau đăng nhập tác giả, chữ trong thanh tìm kiếm vẫn tràn xuống quá chiều cao header. Vấn đề không chỉ xảy ra ở tablet 768px.
- Header đầy đủ được bật bằng `md:flex`, trong khi breakpoint md của dự án chỉ là 600px. Logo, tagline, bốn link, tìm kiếm và nút tài khoản cùng cạnh tranh chiều rộng.
- `overflow-x: hidden` toàn trang không giải quyết nguyên nhân và có thể che phần bị tràn.
- Vị trí: `src/components/navigation/DesktopHeader.tsx:35`, `tailwind.config.ts:10`, `src/app/globals.css:43`.
- Đề xuất: giữ điều hướng gọn cho tablet, rút tagline, dùng tìm kiếm icon, và chỉ bật header đầy đủ khi đủ chiều rộng.
- Ảnh: [Trang chủ 768px](D:/Vibecode/webtruyen/output/playwright/home-768.jpg), [Trang chủ 1024px sau đăng nhập](D:/Vibecode/webtruyen/output/playwright/home-1024-author.jpg).

### 3. P1 — “Đọc tiếp” trong tủ sách mở sai chương hoặc trang 404

- Các thẻ trong `/library` dùng cùng slug chương đầu của Trường Khách Sơn Hà cho mọi truyện.
- Thiên Đạo Đồ Thư dẫn tới `/story/thien-dao-do-thu/chapter/chuong-1-kiem-gi-duoi-tang-tung`, trình duyệt hiển thị 404.
- Thẻ đầu báo “Chương 3” nhưng liên kết lại mở chương 1. Tủ sách và home chưa đọc tiến độ đã lưu bởi ReaderCanvas.
- Đổi tab Đang đọc/Theo dõi/Yêu thích/Đã đọc chỉ đổi trạng thái tab; danh sách vẫn là cùng ba truyện mẫu.
- Vị trí: `src/app/library/page.tsx:26`, `src/app/library/page.tsx:115`, `src/app/page.tsx:44`, `src/components/reader/ReaderCanvas.tsx:90`.
- Ảnh: [Tủ sách 320px](D:/Vibecode/webtruyen/output/playwright/library-320.jpg), [Đọc tiếp dẫn tới 404](D:/Vibecode/webtruyen/output/playwright/library-continue-wrong-story.jpg).

### 4. P1 — Hai nút đăng xuất đều không hoàn thành đăng xuất

- Header desktop POST `/api/auth/logout`, nhưng route này không tồn tại; kiểm tra HTTP trả 404.
- Trang cá nhân POST form tới `/api/auth`, trong khi API dùng `req.json()`. Thử bằng WebRequestSession riêng trả 500 và người dùng vẫn đăng nhập.
- JSON `{ action: "logout" }` gửi đúng API hoạt động; phiên kiểm tra riêng đã được dọn bằng cách này.
- Vị trí: `src/components/navigation/DesktopHeader.tsx:117`, `src/app/profile/page.tsx:110`, `src/app/api/auth/route.ts:14`.
- Ảnh: [Trang cá nhân sau khi bấm đăng xuất](D:/Vibecode/webtruyen/output/playwright/profile-logout-error.jpg).

### 5. P2 — Bìa truyện trong tủ sách và Studio không có kích thước ổn định

- Tủ sách dùng `h-22`; quản lý tác phẩm dùng `w-15`. Hai utility không được sinh trong CSS Tailwind hiện tại.
- Tại tủ sách 320px, ảnh bìa có chiều cao/tỉ lệ khác nhau, đặc biệt bìa truyện thứ hai.
- Vị trí: `src/app/library/page.tsx:75`, `src/app/studio/stories/page.tsx:46`.
- Đề xuất: dùng `aspect-[3/4]` với chiều rộng cụ thể và `shrink-0`, hoặc kích thước arbitrary hợp lệ.
- Kiểm tra tiếp trên phiên tác giả do người dùng đăng nhập xác nhận ảnh Studio cũng sai tỉ lệ: hai bìa cùng cao 78px nhưng rộng lần lượt 52px và 117px tại viewport 390px. Tại 320px, thẻ thứ hai mất nhiều diện tích nội dung và metadata bên phải bị cắt.
- Ảnh: [Tủ sách 320px](D:/Vibecode/webtruyen/output/playwright/library-320.jpg).

### 6. P2 — Chữ phụ nhỏ và mờ, điều khiển di động thiếu diện tích chạm

- Metadata trong thẻ, nhãn điều hướng và nhiều nút dùng chữ 10–11px.
- Màu `#6E5F52` trên nền `#1C1714` có tương phản tính được khoảng 2,89:1; trên nền elevated `#261E19` khoảng 2,67:1. Nhãn và metadata khó đọc trong ảnh thực tế.
- Nhiều icon có khung 32–40px, thấp hơn mục tiêu 44–48px của DESIGN.md.
- Vị trí điển hình: `src/components/story/StoryCardMobile.tsx:43`, `src/components/navigation/BottomNavigation.tsx:64`, `src/components/reader/ReaderSettingsSheet.tsx:46`.
- Ảnh: [Khám phá 320px](D:/Vibecode/webtruyen/output/playwright/discover-320.jpg), [Cài đặt đọc 320px](D:/Vibecode/webtruyen/output/playwright/reader-settings-320.jpg).

### 7. P2 — Phông “Literata” trong trình đọc chưa dùng đúng font

- Giao diện chọn font ghi Literata, nhưng nội dung ReaderCanvas sử dụng `font-serif`.
- Font Literata được khai báo qua token `font-reading`, vì vậy lựa chọn hiện tại dùng serif mặc định thay vì token được cấu hình.
- Vị trí: `src/components/reader/ReaderCanvas.tsx:215`, `src/components/reader/ReaderSettingsSheet.tsx:116`, `tailwind.config.ts:45`.

### 8. P2 — Bottom sheet thiếu thao tác bàn phím và ngữ nghĩa truy cập

- Bảng cài đặt và mục lục có nút đóng chỉ icon, thiếu tên truy cập; thiếu role dialog, aria-modal, quản lý focus và xử lý Escape.
- Subagent đã thử Escape và sheet không đóng. Không có cơ chế khóa cuộn nền trong hai component.
- Vị trí: `src/components/reader/ReaderSettingsSheet.tsx:30`, `src/components/reader/ChapterListSheet.tsx:41`.
- Ảnh: [Cài đặt](D:/Vibecode/webtruyen/output/playwright/reader-settings-320.jpg), [Mục lục](D:/Vibecode/webtruyen/output/playwright/reader-toc-320.jpg).

### 9. P2 — Header và nút hành động bị xuống dòng ở điện thoại nhỏ

- Tại 320px, logo Mộc Thư và nút Đăng nhập xuống hai dòng; trong editor, Lưu nháp và Xuất bản cũng xuống hai dòng trong header thấp.
- Editor vẫn vừa chiều rộng 320px và các nút còn dùng được; đây là vấn đề mật độ/bố cục, chưa phải lỗi tràn ngang của editor.
- Đề xuất: giữ logo một dòng, rút phần trang trí trên màn hình nhỏ và tạo khoảng rộng rõ ràng cho các hành động chính.
- Ảnh: [Khám phá 320px](D:/Vibecode/webtruyen/output/playwright/discover-320.jpg), [Editor 320px](D:/Vibecode/webtruyen/output/playwright/editor-320.jpg).

## Vấn đề phát hiện trong mã, chưa thể quan sát đầy đủ do trang lỗi

- CTA đáy trên trang chi tiết truyện đặt `bottom-0 z-30`, cùng vị trí với BottomNavigation `bottom-0 z-40`. Trên màn hình dưới 431px, thanh điều hướng sẽ che phần lớn nút Đọc ngay. Cần xử lý sau khi sửa lỗi render; chưa thể xác nhận bằng giao diện trang lỗi.
- Trang admin cũng truyền onClick trực tiếp từ Server Component (`src/app/admin/page.tsx:123`, `:131`). Kiểm tra sau đăng nhập admin nhận HTTP 200 nhưng HTML chứa digest lỗi và không có nội dung báo cáo; HTTP 200 trong response streaming không chứng minh render thành công.
- Bước đăng nhập Admin demo trong trình duyệt bị automatic approval review từ chối vì yêu cầu gốc chưa chỉ định xác thực quản trị. Không thử lại hoặc đi vòng sau khi bị từ chối. Kiểm tra HTTP admin nói trên đã diễn ra trước lần từ chối; chưa có xác nhận giao diện admin bằng trình duyệt.
- Biểu mẫu chưa nối label với input bằng htmlFor/id. Một số nút chỉ icon khác cũng thiếu aria-label.

## Mức độ hoàn thiện chức năng từ mã nguồn

- Đăng ký chỉ tạo session, chưa lưu tài khoản/mật khẩu vào DB. Đăng nhập chỉ tra bảng DEMO_USERS, nên tài khoản mới không có đường đăng nhập lại sau đăng xuất.
- Studio và editor chưa kiểm tra vai trò/ownership; người chưa đăng nhập vẫn mở được các route studio. Danh sách tác phẩm cố định cho author-1.
- Tạo truyện, xuất bản chương, lên lịch và xem trước dùng alert/setTimeout; autosave máy chủ là mô phỏng. Nhãn “Đã lưu” chưa đồng nghĩa dữ liệu đã lên máy chủ.
- Bản nháp chỉ ghi localStorage khi nội dung thay đổi; sửa riêng tiêu đề hoặc số chương chưa được ghi tương ứng.
- Thông báo và số liệu dashboard là dữ liệu tĩnh; nút “Đánh dấu đã đọc” chưa có handler.
- Favicon, apple-touch-icon và hai icon được tham chiếu trong manifest đều không có trong public và trả 404.

## Kết quả kiểm tra kỹ thuật

- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: exit 0.
- `npm run lint`: chưa thực hiện được lint; Next mở trình hỏi thiết lập ESLint vì dự án chưa có cấu hình. Không thay đổi cấu hình trong lần đánh giá này.
- HTTP: home/discover/search/library/notifications/genre/reader/studio mở được; story detail và author lỗi 500. Trình duyệt xác nhận ứng dụng lỗi khi bấm Chi tiết.
- Đăng nhập Tác giả demo thành công trong UI. Studio tổng quan, danh sách tác phẩm, tạo truyện và editor đều mở được; các button xuất bản/lưu giả lập chỉ được đánh giá từ mã, không tạo hay xuất bản tác phẩm thật.
- Browser xác nhận bấm Đăng xuất tại trang cá nhân không kết thúc phiên; kết quả HTTP riêng xác định POST form gây 500.
- Click nút Xem trước giả lập của editor làm IAB timeout/tab không đáp ứng; mã cho thấy nút chỉ gọi alert. Không kết luận toàn bộ ứng dụng treo vì chưa loại trừ giới hạn xử lý alert của công cụ browser.
- Chưa chạy lại production build để tránh thay đổi thư mục build đang phục vụ website. Một lần kiểm tra browser không thay thế kiểm thử thiết bị thật, bàn phím ảo iOS/Android hoặc đo hiệu năng.

## Thứ tự xử lý đề xuất

1. Sửa lỗi render truyện/tác giả/admin; khôi phục đường đi từ danh sách tới chi tiết và tác giả.
2. Sửa header tablet, CTA mobile và các kích thước bìa sai utility.
3. Sửa đăng xuất và liên kết Đọc tiếp; nối tiến độ đọc và tab tủ sách vào dữ liệu thực.
4. Tăng khả năng đọc của chữ phụ, diện tích chạm và khả năng truy cập của sheet/form.
5. Hoàn thiện persistence/xác thực/ownership cho Studio trước khi hiển thị các thông báo lưu và xuất bản thành công.

## Kiểm tra trực tiếp sau khi người dùng đăng nhập

Người dùng tự đăng nhập tài khoản tác giả Cố Niệm Vũ trong browser đang hiển thị, sau đó bàn giao phiên để tiếp tục đánh giá. Đã kiểm tra Studio, quản lý tác phẩm, editor, tạo truyện, luồng xem trước, trang chủ, trình đọc và tủ sách. Dùng kích thước browser thực tế, desktop 1440×900, mobile 390×844 và 320×700; đã reset viewport khi kết thúc và giữ browser ở Studio.

### Kết quả mới hoặc được xác minh lại

- **Header tràn ngay ở kích thước browser thực tế:** tagline chồng lên banner Studio; ô tìm kiếm nhiều dòng tràn khỏi header. [Ảnh Studio hiện tại](D:/Vibecode/webtruyen/output/playwright/live/studio-current.jpg).
- **Quản lý tác phẩm thiếu đồng nhất kích thước bìa:** đo từ DOM được bìa 52×78px và 117×78px tại 390px. Metadata bị ép xuống dòng; ở 320px, phần thông tin truyện thứ hai bị cắt bên phải. [Desktop](D:/Vibecode/webtruyen/output/playwright/live/stories-1440.jpg), [390px](D:/Vibecode/webtruyen/output/playwright/live/stories-390.jpg), [320px](D:/Vibecode/webtruyen/output/playwright/live/stories-320.jpg).
- **Studio → Xem trước truyện vẫn lỗi:** browser hiển thị Application error và console ghi lỗi render Server Components. [Ảnh lỗi xem trước](D:/Vibecode/webtruyen/output/playwright/live/story-preview-error.jpg).
- **Editor vừa chiều rộng 320px:** documentWidth=320, ô tiêu đề rộng 200px, textarea rộng 288px. Nút Lưu nháp/Xuất bản xuống dòng; placeholder mờ. [Ảnh editor](D:/Vibecode/webtruyen/output/playwright/live/editor-320.jpg).
- **Biểu mẫu tạo truyện không tràn ngang:** documentWidth=320. Cả bảy label đều có htmlFor rỗng, xác nhận thiếu liên kết nhãn với ô nhập. [Ảnh form](D:/Vibecode/webtruyen/output/playwright/live/create-story-320.jpg).
- **Font trình đọc không khớp nhãn Literata:** computed font-family của nội dung là `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif`. Nội dung nền Giấy Cũ đọc được; justify ở 320px tạo khoảng cách từ không đều. [Ảnh trình đọc](D:/Vibecode/webtruyen/output/playwright/live/reader-320.jpg).
- **Escape không đóng bảng cài đặt:** cây truy cập vẫn giữ nguyên bảng và focus còn ở nút Cài đặt ngoài bảng. Nút đóng trên giao diện hoạt động. [Ảnh bảng cài đặt](D:/Vibecode/webtruyen/output/playwright/live/reader-settings-320.jpg).
- **Tủ sách thiếu phân biệt dữ liệu các ngăn:** Đang đọc (3) và Theo dõi (5) đều hiển thị cùng ba truyện, dù số lượng trong nhãn khác nhau. [Ngăn Theo dõi](D:/Vibecode/webtruyen/output/playwright/live/library-following-320.jpg).
- **Đọc tiếp truyện thứ hai vẫn dẫn tới 404:** bấm Đọc tiếp Thiên Đạo Đồ Thư mở slug chương của truyện khác. [Ảnh 404](D:/Vibecode/webtruyen/output/playwright/live/library-continue-404.jpg).

Không tạo, xuất bản hoặc chỉnh sửa tác phẩm; không thay đổi mã nguồn. Phiên tác giả vẫn giữ nguyên. Các đánh giá trên là kết quả quan sát trực tiếp, ảnh chụp, DOM hiển thị và thao tác điều hướng trên phiên được người dùng bàn giao.

## Sửa header ở kích thước browser hiện tại

Sau khi người dùng chỉ ra bố cục vẫn lỗi ở khung hiện tại, đã tái hiện tại 763×884px: header cao 64px nhưng tagline kéo từ y=-51 đến y=115; nội dung tìm kiếm cũng vượt chiều cao header và nút Đăng xuất vượt cạnh phải.

Thay đổi trong `DesktopHeader.tsx` và `MobileHeader.tsx`:

- Tablet 600–1023px dùng menu ở hàng riêng; desktop từ 1024px giữ menu cùng hàng.
- Tagline chỉ xuất hiện từ 1440px; logo và nhãn hành động không xuống dòng.
- Tìm kiếm có thể co chiều rộng và rút gọn placeholder trên một dòng.
- Tên tài khoản được giới hạn chiều rộng; các nhóm hành động giữ kích thước ổn định.
- Header mobile dùng logo gọn và ẩn badge trên màn hình dưới 375px để không ép logo xuống hai dòng.

Website local đã chuyển từ server `next start` sang `next dev` tại cùng địa chỉ localhost:3000 để hiển thị mã mới. Phiên đăng nhập vẫn được giữ.

Đối chiếu hình học DOM xác nhận không có phần tử header vượt khung tại 320, 375, 390, 599, 600, 768, 1024 và 1440px. Kiểm tra riêng browser thực tế 763px cũng đạt; header mới cao 113px, nội dung Studio bắt đầu phía dưới và không bị chồng.

Ảnh sau sửa: [Browser 763px](D:/Vibecode/webtruyen/output/playwright/live/header-fixed-current.jpg), [Mobile 320px](D:/Vibecode/webtruyen/output/playwright/live/header-fixed-320.jpg), [Desktop 1440px](D:/Vibecode/webtruyen/output/playwright/live/header-fixed-1440.jpg). [Kết quả đo các viewport](D:/Vibecode/webtruyen/output/playwright/live/header-checks.json).

Các vấn đề khác trong phần khảo sát chưa được xử lý trong lần sửa header này.



