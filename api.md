# TÀI LIỆU & HƯỚNG DẪN TÍCH HỢP HỆ THỐNG API MỘC THƯ

Tài liệu này cung cấp đặc tả kỹ thuật chi tiết, quy chuẩn truyền nhận dữ liệu và ví dụ code mẫu cho toàn bộ hệ thống REST API của nền tảng **Mộc Thư** (`moc-thu-webtruyen`), với trọng tâm là các API Quản trị viên (Tạo truyện, Đăng chương, Quản lý thành viên và Thể loại).

---

## MỤC LỤC
1. [Tổng quan Kiến trúc & Nguyên tắc Thiết kế](#1-tổng-quan-kiến-trúc--nguyên-tắc-thiết-kế)
2. [Cơ chế Xác thực & Phân quyền (Authentication & RBAC)](#2-cơ-chế-xác-thực--phân-quyền-authentication--rbac)
3. [Tài khoản Trải nghiệm Mẫu (Demo Credentials)](#3-tài-khoản-trải-nghiệm-mẫu-demo-credentials)
4. [Quy chuẩn Mã lỗi & Phản hồi (HTTP Status Codes)](#4-quy-chuẩn-mã-lỗi--phản-hồi-http-status-codes)
5. [Phân hệ Quản trị viên: Tác phẩm & Chương hồi (Admin Story & Chapter)](#5-phân-hệ-quản-trị-viên-tác-phẩm--chương-hồi)
   - [5.1. Tạo tác phẩm mới (`POST /api/admin/stories`)](#51-tạo-tác-phẩm-mới-post-apiadminstories)
   - [5.2. Lấy danh sách tác phẩm quản trị (`GET /api/admin/stories`)](#52-lấy-danh-sách-tác-phẩm-quản-trị-get-apiadminstories)
   - [5.3. Khóa, Mở khóa & Ghim tác phẩm (`PUT /api/admin/stories/:id`)](#53-khóa-mở-khóa--ghim-tác-phẩm-put-apiadminstoriesid)
   - [5.4. Xóa vĩnh viễn tác phẩm (`DELETE /api/admin/stories/:id`)](#54-xóa-vĩnh-viễn-tác-phẩm-delete-apiadminstoriesid)
   - [5.5. Đăng chương mới cho truyện (`POST /api/admin/chapters`)](#55-đăng-chương-mới-cho-truyện-post-apiadminchapters)
   - [5.6. Lấy danh sách chương của truyện (`GET /api/admin/chapters`)](#56-lấy-danh-sách-chương-của-truyện-get-apiadminchapters)
6. [Phân hệ Quản trị viên: Người dùng & Danh mục (Admin Users & Categories)](#6-phân-hệ-quản-trị-viên-người-dùng--danh-mục)
   - [6.1. Danh sách & Tạo người dùng (`GET` & `POST /api/admin/users`)](#61-danh-sách--tạo-người-dùng-get--post-apiadminusers)
   - [6.2. Khóa / Mở khóa tài khoản (`POST /api/admin/users/:id/ban`)](#62-khóa--mở-khóa-tài-khoản-post-apiadminusersidban)
   - [6.3. Quản lý Thể loại (`/api/admin/genres`)](#63-quản-lý-thể-loại-apiadmingenres)
   - [6.4. Quản lý Danh hiệu & Huy hiệu (`/api/admin/badges`)](#64-quản-lý-danh-hiệu--huy-hiệu-apiadminbadges)
7. [Phân hệ Xác thực & Hồ sơ cá nhân (Auth & Profile)](#7-phân-hệ-xác-thực--hồ-sơ-cá-nhân)
8. [Code Mẫu Tích hợp (cURL, JavaScript Fetch, Python)](#8-code-mẫu-tích-hợp)

---

## 1. Tổng quan Kiến trúc & Nguyên tắc Thiết kế

* **Production URL (Vercel)**: `https://webtruyen-eta.vercel.app`
* **Local Base URL**: `http://localhost:3000` (hoặc `http://localhost:3001` tùy môi trường máy chủ cục bộ).
* **Kiến trúc**: Next.js 15+ App Router Route Handlers (`src/app/api/...`).
* **Định dạng dữ liệu**: `application/json` chuẩn UTF-8 (hỗ trợ hiển thị tiếng Việt có dấu đầy đủ).
* **Tự động đếm từ**: Các API đăng nội dung chương tích hợp bộ đếm từ tiếng Việt chuẩn mực theo khoảng trắng Unicode.
* **Kiểm toán tự động (Audit Trail)**: Mọi thao tác trọng yếu của Quản trị viên (tạo truyện, đăng chương, khóa/mở khóa, đổi quyền, xóa dữ liệu) đều được tự động ghi nhận vào Nhật ký kiểm toán `AdminAuditLog`.

---

## 2. Cơ chế Xác thực & Phân quyền (Authentication & RBAC)

Hệ thống hỗ trợ 2 phương thức xác thực linh hoạt và bảo mật cao cho Quản trị viên:

### 2.1. Xác thực bằng Mã Khóa Quản Trị Viên (Admin API Key - KHUYÊN DÙNG CHO API)
* **Header khuyên dùng**: `x-api-key: <ADMIN_API_KEY>`
* **Header chuẩn Bearer**: `Authorization: Bearer <ADMIN_API_KEY>`
* **Mã khóa mặc định**: `mocthu_live_admin_key_2026_vibecode_998877`
* **Xem và quản lý trực tiếp trên Web**: Quản trị viên chỉ cần truy cập trang `/admin`, chọn Tab **"Tài liệu API & Khóa API Key"** để:
  * Xem mã khóa (hỗ trợ ẩn/hiện mã).
  * Sao chép mã 1-chạm vào khay nhớ tạm.
  * Bấm nút **"Sinh lại khóa mới"** để thu hồi khóa cũ và cấp khóa mới tức thì.
  * Tra cứu đầy đủ tài liệu API tương tác, bảng tham số và lệnh cURL gắn sẵn khóa thật.

> 🛡️ **Lưu ý bảo mật**: Khi sử dụng Admin API Key trong Header, hệ thống sẽ tự động định danh người gọi là Quản Trị Viên Tối Cao và cấp quyền thực thi mọi API quản trị (Tạo truyện, Đăng chương, Khóa/Mở khóa tác phẩm, Quản lý thành viên) mà không cần đăng nhập Cookie hay qua form giao diện.

### 2.2. Cơ chế Dự Phòng: JWT Session Cookie (Dành cho Web Browser)
* Khi Quản trị viên đăng nhập trực tiếp trên giao diện website bằng tài khoản Admin (`hotprince` / `Napoleong112@`), trình duyệt sẽ lưu cookie `mocthu_session` (cờ `httpOnly: true`). Hệ thống tự động nhận diện cookie này nếu Request không truyền header `x-api-key`.

### 2.3. Các cấp bậc vai trò người dùng (Role):
1. `GUEST`: Khách vãng lai chưa đăng nhập (chỉ xem truyện công khai, tìm kiếm).
2. `READER`: Độc giả đã đăng nhập (đánh dấu trang, lưu tủ sách, bình luận).
3. `AUTHOR`: Tác giả (quyền độc giả + quyền truy cập Author Studio để đăng truyện và chương của chính mình).
4. `MODERATOR`: Kiểm duyệt viên cộng đồng.
5. `ADMIN`: Quản trị viên tối cao (toàn quyền hệ thống, quản lý mọi truyện, đăng chương cho bất kỳ tác giả nào, khóa tài khoản, phê duyệt danh mục).

---

## 3. Tài khoản Trải nghiệm Mẫu (Demo Credentials)

| Vai trò | Tên đăng nhập / Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| 👑 **Quản trị viên** | `hotprince` hoặc `admin@mocthu.vn` | `Napoleong112@` / `admin123` | Toàn quyền kiểm duyệt, khởi tạo tác phẩm, đăng chương |
| 🖋️ **Tác giả** | `author@mocthu.vn` | `author123` | Tác giả ký hợp đồng (Cố Niệm Vũ) |
| 📖 **Độc giả** | `reader@mocthu.vn` | `reader123` | Độc giả tiêu chuẩn (Lâm Phong) |

---

## 4. Quy chuẩn Mã lỗi & Phản hồi (HTTP Status Codes)

| Mã HTTP | Tên chuẩn | Ý nghĩa |
| :---: | :--- | :--- |
| `200` | OK | Xử lý yêu cầu thành công, trả về dữ liệu. |
| `201` | Created | Khởi tạo thành công bản ghi mới (Tác phẩm, Chương hồi, Người dùng). |
| `400` | Bad Request | Dữ liệu đầu vào thiếu trường bắt buộc hoặc sai định dạng. |
| `401` | Unauthorized | Chưa đăng nhập hoặc cookie phiên đã hết hạn. |
| `403` | Forbidden | Đã đăng nhập nhưng không đủ quyền hạn (ví dụ: không phải Admin). |
| `404` | Not Found | Không tìm thấy tài nguyên mục tiêu (ID/Slug không tồn tại). |
| `409` | Conflict | Dữ liệu bị xung đột (ví dụ: đường dẫn tĩnh `slug` đã tồn tại). |
| `500` | Internal Server Error | Lỗi nội bộ máy chủ trong quá trình xử lý. |

---

## 5. Phân hệ Quản trị viên: Tác phẩm & Chương hồi

### 5.1. Tạo tác phẩm mới (`POST /api/admin/stories`)

Khởi tạo một bộ truyện mới vào hệ thống với đầy đủ thông số. Cho phép Admin gán tác quyền cho một thành viên có sẵn hoặc nhập tác giả độc lập tùy ý.

* **Endpoint**: `POST /api/admin/stories`
* **Quyền hạn**: `ADMIN`
* **Headers**: `Content-Type: application/json`

#### Tham số Request Body:

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `title` | `string` | **Có** | Tên truyện (tối thiểu 2 ký tự). |
| `slug` | `string` | Không | Đường dẫn tĩnh SEO. Để trống sẽ tự sinh từ `title`. |
| `authorMode` | `string` | **Có** | `"CUSTOM"` (nhập tự do) hoặc `"EXISTING_USER"` (chọn user). |
| `authorId` | `string` | Tùy chọn | ID người dùng nếu `authorMode === "EXISTING_USER"`. |
| `authorName` | `string` | **Có** | Tên hiển thị của tác giả. |
| `authorPenName` | `string` | Không | Bút danh chính thức của tác giả. |
| `authorAvatar` | `string` | Không | URL ảnh đại diện của tác giả. |
| `genres` | `string[]` | **Có** | Danh sách thể loại (ít nhất 1 thể loại). |
| `tags` | `string[]` | Không | Danh sách thẻ từ khóa (ví dụ: `["Trọng Sinh", "Cổ Phong"]`). |
| `shortDescription` | `string` | **Có** | Giới thiệu tóm tắt truyện (hiển thị trên thẻ card & SEO). |
| `fullDescription` | `string` | Không | Giới thiệu chi tiết / Lời tựa toàn văn. |
| `coverUrl` | `string` | **Có** | URL ảnh bìa (tỷ lệ 3:4). |
| `bannerUrl` | `string` | Không | URL ảnh bìa ngang khổ lớn. |
| `status` | `string` | Không | `"ONGOING"` (Đang ra - mặc định) \| `"COMPLETED"` \| `"DRAFT"`. |
| `featured` | `boolean` | Không | Ghim lên Spotlight Bảng vàng Nguyệt San (`true`/`false`). |

#### Ví dụ Request Body:
```json
{
  "title": "Bạch Lạc Ma Kinh",
  "slug": "bach-lac-ma-kinh",
  "authorMode": "CUSTOM",
  "authorName": "Độc Cô Nhạn",
  "authorPenName": "Độc Cô Nhạn",
  "genres": ["Tiên Hiệp", "Huyền Huyễn"],
  "tags": ["Ma Đạo", "Trọng Sinh", "Cổ Phong"],
  "shortDescription": "Vạn năm ma đạo luân hồi, một sớm tỉnh giấc giữa tuyết trắng ngập trời thành Lạc Dương.",
  "fullDescription": "Đời trước tu ma kinh đến tuyệt cảnh, bị vạn đạo chính phái vây hãm tại Ma Vực Đỉnh...",
  "coverUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
  "status": "ONGOING",
  "featured": true
}
```

#### Ví dụ Response (`201 Created`):
```json
{
  "success": true,
  "message": "Đã khởi tạo tác phẩm \"Bạch Lạc Ma Kinh\" thành công!",
  "story": {
    "id": "story-1791300787619",
    "title": "Bạch Lạc Ma Kinh",
    "slug": "bach-lac-ma-kinh",
    "authorId": "custom-author-doc-co-nhan",
    "authorName": "Độc Cô Nhạn",
    "authorPenName": "Độc Cô Nhạn",
    "coverUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    "shortDescription": "Vạn năm ma đạo luân hồi, một sớm tỉnh giấc giữa tuyết trắng ngập trời thành Lạc Dương.",
    "status": "ONGOING",
    "genres": ["Tiên Hiệp", "Huyền Huyễn"],
    "tags": ["Ma Đạo", "Trọng Sinh", "Cổ Phong"],
    "totalChapters": 0,
    "wordCount": 0,
    "featured": true,
    "updatedAt": "2026-10-06T15:33:00.000Z"
  }
}
```

---

### 5.2. Lấy danh sách tác phẩm quản trị (`GET /api/admin/stories`)

* **Endpoint**: `GET /api/admin/stories`
* **Quyền hạn**: `ADMIN`
* **Query Parameters**:
  * `q` (string): Tìm kiếm theo tên truyện, tên tác giả, bút danh.
  * `genre` (string): Lọc theo thể loại.
  * `status` (string): Lọc theo trạng thái (`ONGOING`, `COMPLETED`, `DRAFT`).
  * `featured` (boolean string): `true` hoặc `false`.

#### Ví dụ Request:
```bash
GET /api/admin/stories?q=Bạch%20Lạc&featured=true
```

#### Ví dụ Response (`200 OK`):
```json
{
  "success": true,
  "total": 1,
  "stories": [
    {
      "id": "story-1791300787619",
      "title": "Bạch Lạc Ma Kinh",
      "slug": "bach-lac-ma-kinh",
      "authorName": "Độc Cô Nhạn",
      "totalChapters": 0,
      "viewsCount": 0,
      "status": "ONGOING",
      "featured": true
    }
  ]
}
```

---

### 5.3. Khóa, Mở khóa & Ghim tác phẩm (`PUT /api/admin/stories/:id`)

* **Endpoint**: `PUT /api/admin/stories/:id` (với `:id` là ID hoặc Slug của tác phẩm).
* **Quyền hạn**: `ADMIN`

#### Request Body theo từng hành động:
1. **Khóa tác phẩm (Ban Story)**:
```json
{
  "action": "ban",
  "reason": "Nội dung vi phạm chính sách bản quyền"
}
```

2. **Mở khóa tác phẩm (Unban Story)**:
```json
{
  "action": "unban"
}
```

3. **Ghim / Bỏ ghim Spotlight Bảng vàng**:
```json
{
  "action": "feature",
  "isFeatured": true
}
```

---

### 5.4. Xóa vĩnh viễn tác phẩm (`DELETE /api/admin/stories/:id`)

* **Endpoint**: `DELETE /api/admin/stories/:id`
* **Quyền hạn**: `ADMIN`
* **Mô tả**: Xóa truyện và toàn bộ các chương liên quan khỏi hệ thống, đồng thời ghi lại audit log.

---

### 5.5. Đăng chương mới cho truyện (`POST /api/admin/chapters`)

Cho phép Quản trị viên đăng chương mới cho bất kỳ bộ truyện nào. Hệ thống tự động tính số chữ tiếng Việt, tự động tăng số chương của truyện và cập nhật thời gian sửa đổi.

* **Endpoints hỗ trợ**:
  * `POST /api/admin/chapters` (Truyền `storyId` hoặc `storySlug` trong body).
  * `POST /api/admin/stories/:id/chapters` (Alias với `:id` là ID hoặc Slug truyện).
* **Quyền hạn**: `ADMIN`
* **Headers**: `Content-Type: application/json`

#### Tham số Request Body:

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `storyId` | `string` | **Có** | ID hoặc Slug của bộ truyện cần đăng chương. |
| `chapterNumber` | `number` | Không | Số thứ tự chương. Nếu để trống, tự động gán bằng `totalChapters + 1`. |
| `title` | `string` | **Có** | Tên chương (ví dụ: `"Chương 1: Tuyết Lạc Ma Tiếu"`). |
| `slug` | `string` | Không | Slug chương. Để trống sẽ tự sinh dạng `chuong-X-[tieu-de]`. |
| `content` | `string` | **Có** | Toàn văn nội dung chương truyện. |
| `status` | `string` | Không | `"PUBLISHED"` (Xuất bản ngay - mặc định) \| `"DRAFT"` (Lưu bản nháp). |
| `notifyFollowers` | `boolean` | Không | Có gửi thông báo cho độc giả đang theo dõi truyện hay không (mặc định: `true`). |

#### Ví dụ Request Body:
```json
{
  "storyId": "story-1791300787619",
  "title": "Chương 1: Tuyết Lạc Ma Tiếu",
  "content": "Gió bấc rít gào qua khe cửa gỗ mục nát... Lý Bạch Lạc mở mắt ra, nhìn bàn tay non nớt của tuổi niên thiếu. Một kiếp phong ba mười vạn ma binh chôn vùi trong biển máu, chẳng ngờ trời cao lại cho hắn một cơ hội bắt đầu lại.",
  "status": "PUBLISHED"
}
```

#### Ví dụ Response (`201 Created`):
```json
{
  "success": true,
  "message": "Đã đăng Chương 1: Tuyết Lạc Ma Tiếu cho tác phẩm \"Bạch Lạc Ma Kinh\" thành công!",
  "chapter": {
    "id": "chap-1791300800000",
    "storyId": "story-1791300787619",
    "storySlug": "bach-lac-ma-kinh",
    "chapterNumber": 1,
    "title": "Chương 1: Tuyết Lạc Ma Tiếu",
    "slug": "chuong-1-tuyet-lac-ma-tieu",
    "wordCount": 50,
    "publishedAt": "2026-10-06T15:33:08.113Z"
  },
  "updatedStory": {
    "id": "story-1791300787619",
    "title": "Bạch Lạc Ma Kinh",
    "slug": "bach-lac-ma-kinh",
    "totalChapters": 1,
    "wordCount": 50,
    "updatedAt": "2026-10-06T15:33:08.113Z"
  }
}
```

---

### 5.6. Lấy danh sách chương của truyện (`GET /api/admin/chapters`)

* **Endpoint**: `GET /api/admin/chapters?storyId=:storyId` hoặc `GET /api/admin/stories/:id/chapters`
* **Quyền hạn**: `ADMIN`
* **Response**: Trả về danh sách tất cả các chương thuộc về bộ truyện đó kèm thông tin tóm tắt truyện.

---

## 6. Phân hệ Quản trị viên: Người dùng & Danh mục

### 6.1. Danh sách & Tạo người dùng (`GET` & `POST /api/admin/users`)

* **Lấy danh sách**: `GET /api/admin/users?q=admin&role=ADMIN&status=ACTIVE`
* **Tạo tài khoản mới**: `POST /api/admin/users`
```json
{
  "email": "editor@mocthu.vn",
  "username": "editor_chuyennghiep",
  "name": "Biên Tập Viên Mộc Thư",
  "role": "AUTHOR",
  "penName": "Huyền Thư Các Chủ"
}
```

### 6.2. Khóa / Mở khóa tài khoản (`POST /api/admin/users/:id/ban`)

* **Endpoint**: `POST /api/admin/users/:id/ban`
```json
{
  "action": "ban",
  "reason": "Phát tán bình luận rác và ngôn từ tiêu cực nhiều lần"
}
```
*(Để mở khóa, truyền `"action": "unban"`)*.

### 6.3. Quản lý Thể loại (`/api/admin/genres`)

* `GET /api/admin/genres`: Lấy danh sách thể loại.
* `POST /api/admin/genres`: Thêm thể loại mới (`{ "name": "Võng Du", "description": "Game thực tế ảo..." }`).
* `DELETE /api/admin/genres/:id`: Xóa thể loại.

### 6.4. Quản lý Danh hiệu & Huy hiệu (`/api/admin/badges`)

* `GET /api/admin/badges`: Lấy danh sách huy hiệu.
* `POST /api/admin/badges`: Tạo danh hiệu mới.
* `POST /api/admin/badges/assign`: Trao danh hiệu cho thành viên (`{ "userId": "...", "badgeId": "...", "action": "assign" }`).

---

## 7. Phân hệ Xác thực & Hồ sơ cá nhân

### 7.1. Đăng nhập / Đăng xuất (`POST /api/auth`)

* **Đăng nhập**:
```bash
POST /api/auth
Content-Type: application/json

{
  "action": "login",
  "email": "hotprince",
  "password": "Napoleong112@"
}
```
* **Đăng ký**:
```bash
POST /api/auth
Content-Type: application/json

{
  "action": "register",
  "email": "user@gmail.com",
  "username": "username123",
  "password": "Password123@",
  "name": "Độc Giả Thân Thiết",
  "role": "READER"
}
```
* **Đăng xuất**:
```bash
POST /api/auth
Content-Type: application/json

{
  "action": "logout"
}
```

### 7.2. Hồ sơ cá nhân (`GET` & `PUT /api/profile`)

* `GET /api/profile`: Lấy thông tin tài khoản hiện tại kèm thống kê tu vi và huy hiệu.
* `PUT /api/profile`: Cập nhật thông tin (tiểu sử, avatar, đổi mật khẩu). *Lưu ý: Tên hiển thị người dùng được khóa bảo vệ, chỉ có Admin mới có quyền đổi tên.*

---

## 8. Code Mẫu Tích hợp (Tự Động Xác Thực Qua API Key)

### 8.1. cURL (Sử dụng Header `x-api-key` - Không cần đăng nhập)

#### A. Gọi API Tạo truyện mới:
```bash
curl -X POST https://webtruyen-eta.vercel.app/api/admin/stories \
  -H "Content-Type: application/json" \
  -H "x-api-key: mocthu_live_admin_key_2026_vibecode_998877" \
  -d '{
    "title": "Kiếm Ma Độc Cô",
    "slug": "kiem-ma-doc-co",
    "authorName": "Cổ Long",
    "genres": ["Kiếm Hiệp", "Cổ Phong"],
    "shortDescription": "Thanh kiếm cô độc giữa gió tuyết mười năm...",
    "coverUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    "status": "ONGOING",
    "featured": true
  }'
```

#### B. Gọi API Đăng chương mới:
```bash
curl -X POST https://webtruyen-eta.vercel.app/api/admin/chapters \
  -H "Content-Type: application/json" \
  -H "x-api-key: mocthu_live_admin_key_2026_vibecode_998877" \
  -d '{
    "storyId": "kiem-ma-doc-co",
    "chapterNumber": 1,
    "title": "Chương 1: Kiếm gãy trong tuyết",
    "content": "Tuyết rơi trắng xóa trên đỉnh Hoa Sơn. Một bóng người cô độc bước đi chậm rãi giữa màn sương lạnh buốt...",
    "status": "PUBLISHED"
  }'
```

#### C. Lấy hoặc Sinh lại mã khóa API Key Quản trị viên:
```bash
# Lấy mã khóa hiện hành:
curl -H "x-api-key: mocthu_live_admin_key_2026_vibecode_998877" \
  https://webtruyen-eta.vercel.app/api/admin/api-key

# Sinh lại mã khóa ngẫu nhiên mới:
curl -X POST https://webtruyen-eta.vercel.app/api/admin/api-key \
  -H "Content-Type: application/json" \
  -H "x-api-key: mocthu_live_admin_key_2026_vibecode_998877" \
  -d '{"action": "regenerate"}'
```

---

### 8.2. JavaScript / TypeScript (`fetch` API với API Key)

```typescript
const ADMIN_API_KEY = "mocthu_live_admin_key_2026_vibecode_998877";
const BASE_URL = "https://webtruyen-eta.vercel.app"; // hoặc "http://localhost:3000" khi test local

async function adminWorkflow() {
  // 1. Tạo truyện mới trực tiếp bằng API Key
  const storyRes = await fetch(`${BASE_URL}/api/admin/stories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ADMIN_API_KEY,
    },
    body: JSON.stringify({
      title: "Trường Sinh Bất Tử Lục",
      slug: "truong-sinh-bat-tu-luc",
      authorName: "Vong Ngữ",
      genres: ["Tiên Hiệp", "Tu Chân"],
      tags: ["Phàm Nhân", "Điềm Đạm"],
      shortDescription: "Hành trình tu tiên gian nan từ một phàm nhân bình thường.",
      coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      status: "ONGOING",
      featured: false,
    }),
  });

  const { story } = await storyRes.json();
  console.log("Đã tạo truyện thành công:", story.title, "ID:", story.id);

  // 2. Đăng Chương 1 cho truyện
  const chapterRes = await fetch(`${BASE_URL}/api/admin/chapters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ADMIN_API_KEY,
    },
    body: JSON.stringify({
      storyId: story.id,
      chapterNumber: 1,
      title: "Chương 1: Vách đá ngộ đạo",
      content: "Mặt trời vừa ló dạng sau rặng núi phía đông. Lý Vân ngồi xếp bằng bên tảng đá xanh, cảm nhận từng luồng linh khí mỏng manh len lỏi...",
      status: "PUBLISHED",
    }),
  });

  const chapterData = await chapterRes.json();
  console.log("Đã đăng chương:", chapterData.chapter.title, "- Số chữ:", chapterData.chapter.wordCount);
}

adminWorkflow().catch(console.error);
```

---

### 8.3. Python (`requests` với Header `x-api-key`)

```python
import requests

BASE_URL = "https://webtruyen-eta.vercel.app"  # hoặc "http://localhost:3000" khi test local
ADMIN_API_KEY = "mocthu_live_admin_key_2026_vibecode_998877"

headers = {
    "Content-Type": "application/json",
    "x-api-key": ADMIN_API_KEY,
}

# 1. Tạo truyện mới trực tiếp bằng API Key
story_payload = {
    "title": "Cửu U Ma Tôn",
    "slug": "cuu-u-ma-ton",
    "authorName": "Cổ Chân Nhân",
    "genres": ["Tiên Hiệp", "Huyền Huyễn"],
    "tags": ["Ma Đạo", "Trọng Sinh"],
    "shortDescription": "Sau vạn năm bị phong ấn dưới đáy biển Cửu U, Ma Tôn tái sinh...",
    "coverUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    "status": "ONGOING",
    "featured": True
}
story_res = requests.post(f"{BASE_URL}/api/admin/stories", json=story_payload, headers=headers)
assert story_res.status_code == 201, f"Lỗi tạo truyện: {story_res.text}"
story_data = story_res.json()["story"]
print(f"Đã tạo tác phẩm: {story_data['title']} (ID: {story_data['id']})")

# 2. Đăng chương mới cho truyện
chapter_payload = {
    "storyId": story_data["id"],
    "chapterNumber": 1,
    "title": "Chương 1: Huyết Nguyệt Tái Khởi",
    "content": "Bóng đêm thăm thẳm bao trùm vạn dặm. Giữa hư không bỗng nứt ra một khe hở đen ngòm...",
    "status": "PUBLISHED"
}
chap_res = requests.post(f"{BASE_URL}/api/admin/chapters", json=chapter_payload, headers=headers)
assert chap_res.status_code == 201, f"Lỗi đăng chương: {chap_res.text}"
chap_data = chap_res.json()["chapter"]
print(f"Đã đăng {chap_data['title']} ({chap_data['wordCount']} chữ) thành công!")
```

---

## 9. Liên hệ & Đóng góp
* **Nhóm phát triển**: Đội ngũ Kỹ thuật Nền tảng Mộc Thư.
* **Tài liệu thiết kế kiến trúc**: [`DESIGN.md`](file:///d:/Vibecode/webtruyen/DESIGN.md) & [`DECISIONS.md`](file:///d:/Vibecode/webtruyen/DECISIONS.md).
