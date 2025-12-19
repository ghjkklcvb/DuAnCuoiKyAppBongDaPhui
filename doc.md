📚 HỆ THỐNG QUẢN LÝ GIẢI ĐẤU BÓNG ĐÁ PHỦI
🎯 TỔNG QUAN CÁC TÍNH NĂNG CHÍNH
1. Quản lý User (Authentication & Profile)
•	✅ Đăng ký tài khoản với validation mạnh (email, password phức tạp)
•	✅ Đăng nhập với JWT (Access Token + Refresh Token)
•	✅ Bảo mật: Login attempts (khóa tài khoản sau 5 lần sai - 15 phút)
•	✅ Rate limiting: 10 requests/15 phút cho endpoint login
•	✅ Refresh token để gia hạn access token
•	✅ Đăng xuất (xóa refresh token khỏi database)
•	✅ Xem/Cập nhật profile (username, avatar)
•	✅ Upload avatar lên Cloudinary (max 5MB)
•	✅ Đổi mật khẩu với validation
•	✅ Xóa tài khoản (cần xác nhận mật khẩu)
2. Quản lý Giải đấu (League Management)
•	✅ Tạo giải đấu với 2 thể thức: 
o	Round-Robin: Vòng tròn 1 lượt (mỗi đội gặp nhau 1 lần)
o	Group-Stage: Chia bảng (3-6 đội/bảng)
•	✅ 2 chế độ: 
o	Public: Ai cũng xem được
o	Private: Chỉ owner hoặc người có access token
•	✅ Tự động xác định trạng thái giải dựa vào ngày tháng: 
o	Upcoming: Chưa bắt đầu
o	Ongoing: Đang diễn ra
o	Completed: Đã kết thúc
•	✅ Upload logo giải đấu lên Cloudinary
•	✅ Validation ngày tháng (không được ở quá khứ, endDate > startDate)
•	✅ CRUD giải đấu (Create, Read, Update, Delete)
•	✅ Đổi visibility (public ↔ private)
•	✅ Tạo/Generate access token mới cho giải private
•	✅ Phân trang danh sách giải công khai
•	✅ Không cho update/delete giải đã completed
3. Quản lý Đội bóng (Team Management)
•	✅ Thêm đội vào giải đấu
•	✅ Upload logo đội lên Cloudinary
•	✅ Unique constraint: Tên đội và tên viết tắt không trùng trong cùng giải
•	✅ Validation: Không thêm quá số đội quy định
•	✅ Phân bảng tự động (Round-Robin Assignment): 
o	Phân đều teams vào các bảng
o	Validate đủ số đội trước khi phân
•	✅ Reset phân bảng
•	✅ CRUD đội (chỉ owner giải mới được)
•	✅ Theo dõi stats tự động: 
o	Played, Won, Drawn, Lost
o	Goals For/Against, Goal Difference
o	Points (Thắng +3, Hòa +1, Thua 0)
o	Form (5 trận gần nhất: W/D/L)
4. Quản lý Lịch thi đấu & Kết quả (Match Management)
•	✅ Tạo lịch thi đấu tự động: 
o	Round-Robin Algorithm: Tối ưu, không trùng lặp
o	Group-Stage: Lịch riêng cho từng bảng
•	✅ Xem lịch thi đấu (filter theo vòng, bảng, trạng thái)
•	✅ Cập nhật thông tin trận: 
o	Ngày giờ, sân đấu, trọng tài, ghi chú
•	✅ Cập nhật kết quả tỷ số: 
o	Tự động tính điểm cho 2 đội
o	Tự động update stats (played, won, goals, points...)
o	Tự động update form (W/D/L)
o	Có thể sửa kết quả cũ (revert stats rồi tính lại)
•	✅ Video Full Match: 
o	Nhập URL YouTube hoặc Cloudinary
•	✅ Upload Highlight Videos: 
o	Upload file video từ máy lên Cloudinary
o	Mỗi video tối đa 20MB (fix cứng)
o	Số video tối đa = tổng bàn thắng (homeScore + awayScore)
o	Có thể thêm title cho mỗi video
o	Xóa từng video highlight
•	✅ Upload Photos: 
o	Tối đa 10 ảnh/trận
o	Upload lên Cloudinary
•	✅ Reset kết quả: 
o	Reset 1 trận: Xóa kết quả, stats về 0
o	Reset toàn bộ giải: Xóa tất cả kết quả, stats về 0
•	✅ Xóa trận đấu (chỉ được xóa nếu chưa có kết quả hoặc đã reset)
•	✅ Xóa toàn bộ lịch thi đấu (nếu chưa có trận nào finished)
5. Bảng Xếp Hạng & Thống kê (Standings & Statistics)
•	✅ Bảng xếp hạng (Standings): 
o	Sắp xếp theo: Điểm > Hiệu số > Bàn thắng > Tên
o	BXH toàn giải (Round-Robin)
o	BXH theo từng bảng (Group-Stage)
o	BXH tất cả bảng
o	Hiển thị: Position, Team info, Stats, Form
•	✅ Thống kê tổng quan giải đấu: 
o	Tổng số đội, trận, bàn thắng
o	Số trận đã đấu / còn lại
o	Trung bình bàn thắng/trận
•	✅ Top Rankings: 
o	Top Scorers: 5 đội ghi bàn nhiều nhất
o	Best Defense: 5 đội để thủng lưới ít nhất
o	Best Form: 5 đội phong độ tốt nhất (tính theo form 5 trận)
•	✅ Thống kê chi tiết từng đội: 
o	Stats đầy đủ
o	Form 5 trận gần nhất
o	Tỷ lệ thắng sân nhà/sân khách
o	10 trận gần nhất
•	✅ Phân quyền xem BXH: 
o	Public league: Ai cũng xem được
o	Private league: Owner hoặc có access token
6. Bảo mật & Phân quyền
•	✅ JWT Authentication (Access Token + Refresh Token)
•	✅ Password hashing với bcrypt
•	✅ Rate limiting (tránh spam)
•	✅ Owner-based permissions (chỉ người tạo giải mới sửa/xóa)
•	✅ Private league với access token
•	✅ File upload validation (size, format)
•	✅ Login attempts tracking
•	✅ Account lockout mechanism
7. Upload Files
•	✅ Upload ảnh: User avatar, League logo, Team logo, Match photos
•	✅ Upload video: Match highlights (max 20MB/video)
•	✅ Tích hợp Cloudinary
•	✅ Validation: Size, format, số lượng
________________________________________
📖 API DOCUMENTATION - TEST TỪ ĐẦU ĐẾN CUỐI
BASE URL: https://fleague-tournament-system.onrender.com/api/v1
PUT thay thành PATCH nhé
________________________________________
1️⃣ AUTH MODULE (Xác thực & Quản lý User)
1.1. Đăng ký tài khoản
POST /user/register
Content-Type: application/json
Request Body:
json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Test@123"
}
Validation:
•	Username: 3-30 ký tự, chỉ chữ cái, số, dấu gạch dưới
•	Email: Format hợp lệ
•	Password: Tối thiểu 8 ký tự, có chữ thường, chữ hoa, số, ký tự đặc biệt (@$!%*?&)
Response Success (201):
json
{
  "message": "Đăng ký thành công",
  "user": {
    "_id": "674d1234567890abcdef1234",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": null,
    "createdLeagues": [],
    "failedAttempts": 0,
    "lockUntil": null,
    "createdAt": "2024-12-06T10:00:00.000Z",
    "updatedAt": "2024-12-06T10:00:00.000Z"
  }
}
Response Error (400):
json
{
  "message": "User đã tồn tại!"
}
```

---

### **1.2. Đăng nhập**
```
POST /user/login
Content-Type: application/json
Rate Limit: 10 requests / 15 phút
Request Body:
json
{
  "email": "john@example.com",
  "password": "Test@123"
}
Response Success (200):
json
{
  "message": "Đăng nhập thành công!",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Token Info:
•	Access Token: Hết hạn sau 15 phút
•	Refresh Token: Hết hạn sau 7 ngày
Response Error (400):
json
{
  "message": "Email không tồn tại!"
}
// hoặc
{
  "message": "Sai mật khẩu!"
}
Response Error (403) - Account Locked:
json
{
  "message": "Tài khoản bị khóa đến 10:15:30"
}
```

---

### **1.3. Refresh Token**
```
POST /user/refresh
Content-Type: application/json
Request Body:
json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Response Success (200):
json
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### **1.4. Đăng xuất**
```
POST /user/logout
Content-Type: application/json
Request Body:
json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Response Success (200):
json
{
  "message": "Đăng xuất thành công!"
}
```

---

### **1.5. Xem Profile**
```
GET /user/profile
Authorization: Bearer {accessToken}
Response Success (200):
json
{
  "message": "Thông tin cá nhân",
  "infoUser": {
    "_id": "674d1234567890abcdef1234",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "createdLeagues": ["674d5678...", "674d9012..."],
    "failedAttempts": 0,
    "lockUntil": null,
    "createdAt": "2024-12-06T10:00:00.000Z",
    "updatedAt": "2024-12-06T10:00:00.000Z"
  }
}
```

---

### **1.6. Cập nhật Profile**
```
PUT /user/update-profile
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
Form Data:
•	username: newusername (text)
•	avatar: file.jpg (file - max 5MB)
Response Success (200):
json
{
  "message": "Cập nhật thông tin thành công!",
  "user": {
    "_id": "674d1234567890abcdef1234",
    "username": "newusername",
    "email": "john@example.com",
    "avatar": "https://res.cloudinary.com/.../new-avatar.jpg",
    ...
  }
}
```

---

### **1.7. Đổi mật khẩu**
```
PUT /user/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json
Request Body:
json
{
  "oldPassword": "Test@123",
  "newPassword": "NewPass@456",
  "confirmPassword": "NewPass@456"
}
Response Success (200):
json
{
  "message": "Đổi mật khẩu thành công! Vui lòng đăng nhập lại."
}
```

---

### **1.8. Xóa tài khoản**
```
DELETE /user/delete-account
Authorization: Bearer {accessToken}
Content-Type: application/json
Request Body:
json
{
  "password": "Test@123"
}
Response Success (200):
json
{
  "message": "Xóa tài khoản thành công!"
}
```

---

## 2️⃣ LEAGUE MODULE (Quản lý Giải đấu)

### **2.1. Tạo giải Round-Robin**
```
POST /league/create
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
Form Data:
•	name: Giải Bóng Đá Phủi 2024 (text, required)
•	description: Giải giao hữu cuối tuần (text, optional)
•	type: round-robin (text, required)
•	visibility: public (text, required: public/private)
•	numberOfTeams: 6 (text, required)
•	startDate: 2024-12-15 (text, optional)
•	endDate: 2024-12-30 (text, optional)
•	logo: file.jpg (file, optional, max 5MB)
Response Success (201):
json
{
  "message": "Tạo giải đấu thành công!",
  "league": {
    "_id": "674d5678...",
    "name": "Giải Bóng Đá Phủi 2024",
    "description": "Giải giao hữu cuối tuần",
    "logo": "https://res.cloudinary.com/.../logo.jpg",
    "owner": "674d1234...",
    "type": "round-robin",
    "visibility": "public",
    "accessToken": null,
    "tournamentStatus": "upcoming",
    "numberOfTeams": 6,
    "teams": [],
    "startDate": "2024-12-15T00:00:00.000Z",
    "endDate": "2024-12-30T00:00:00.000Z",
    "createdAt": "2024-12-06T10:30:00.000Z",
    "updatedAt": "2024-12-06T10:30:00.000Z"
  }
}
```

---

### **2.2. Tạo giải Group-Stage (Chia bảng)**
```
POST /league/create
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
Form Data:
•	name: Giải Bóng Đá Chia Bảng 2024 (text, required)
•	type: group-stage (text, required)
•	visibility: private (text, required)
•	numberOfTeams: 12 (text, required)
•	groupSettings[numberOfGroups]: 3 (text, required)
•	groupSettings[teamsPerGroup]: 4 (text, required)
•	startDate: 2024-12-15 (text, optional)
•	endDate: 2024-12-30 (text, optional)
Validation:
•	numberOfTeams = numberOfGroups × teamsPerGroup
•	Ví dụ: 12 đội = 3 bảng × 4 đội/bảng ✅
Response Success (201):
json
{
  "message": "Tạo giải đấu thành công!",
  "league": {
    "_id": "674d5678...",
    "name": "Giải Bóng Đá Chia Bảng 2024",
    "type": "group-stage",
    "visibility": "private",
    "accessToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "tournamentStatus": "upcoming",
    "numberOfTeams": 12,
    "teams": [],
    "groupSettings": {
      "numberOfGroups": 3,
      "teamsPerGroup": 4
    },
    ...
  }
}
```

**Lưu ý:** Giải private sẽ có `accessToken` để chia sẻ

---

### **2.3. Lấy danh sách giải của tôi**
```
GET /league/my-leagues
Authorization: Bearer {accessToken}
Response Success (200):
json
{
  "message": "Danh sách giải đấu của bạn",
  "total": 3,
  "leagues": [
    {
      "_id": "674d5678...",
      "name": "Giải Bóng Đá Phủi 2024",
      "type": "round-robin",
      "visibility": "public",
      "tournamentStatus": "ongoing",
      "numberOfTeams": 6,
      "teams": ["674d9012...", "674d3456..."],
      "owner": {
        "_id": "674d1234...",
        "username": "johndoe",
        "email": "john@example.com",
        "avatar": "..."
      },
      "createdAt": "2024-12-06T10:30:00.000Z"
    },
    // ... more leagues
  ]
}
```

---

### **2.4. Lấy danh sách giải công khai (Public)**
```
GET /league/public?page=1&limit=10
Query Params:
•	page: Số trang (default: 1)
•	limit: Số item/trang (default: 10)
Response Success (200):
json
{
  "message": "Danh sách giải đấu công khai",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "leagues": [...]
}
```

---

### **2.5. Xem chi tiết giải (Public)**
```
GET /league/{leagueId}
Response Success (200):
json
{
  "message": "Chi tiết giải đấu",
  "league": {
    "_id": "674d5678...",
    "name": "Giải Bóng Đá Phủi 2024",
    "description": "...",
    "type": "round-robin",
    "visibility": "public",
    "tournamentStatus": "ongoing",
    "numberOfTeams": 6,
    "owner": {...},
    "teams": [
      {
        "_id": "674d9012...",
        "name": "Manchester United",
        "shortName": "MUN",
        "logo": "..."
      },
      // ... more teams
    ],
    ...
  }
}
```

---

### **2.6. Xem chi tiết giải (Private - cần token)**
```
GET /league/{leagueId}?token={accessToken}
```

**Hoặc với JWT:**
```
GET /league/{leagueId}
Authorization: Bearer {accessToken}
Response Error (403) - Nếu không có quyền:
json
{
  "message": "Giải đấu này ở chế độ riêng tư. Bạn cần có mã truy cập!"
}
```

---

### **2.7. Cập nhật giải**
```
PUT /league/{leagueId}
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
Permission: Chỉ owner
Form Data:
•	name: Updated Name (text, optional)
•	description: Updated description (text, optional)
•	endDate: 2025-01-15 (text, optional)
•	logo: file.jpg (file, optional)
Response Success (200):
json
{
  "message": "Cập nhật giải đấu thành công!",
  "league": {...}
}
Response Error (400) - Giải đã completed:
json
{
  "message": "Không thể cập nhật giải đấu đã kết thúc!"
}
```

---

### **2.8. Xóa giải**
```
DELETE /league/{leagueId}
Authorization: Bearer {accessToken}
Permission: Chỉ owner
Response Success (200):
json
{
  "message": "Xóa giải đấu thành công!"
}
```

---

### **2.9. Đổi trạng thái giải**
```
PUT /league/{leagueId}/status
Authorization: Bearer {accessToken}
Content-Type: application/json
Request Body:
json
{
  "status": "ongoing"
}
Values: upcoming, ongoing, completed
Response Success (200):
json
{
  "message": "Cập nhật trạng thái giải đấu thành công!",
  "league": {...},
  "note": null
}
```

---

### **2.10. Tạo mã truy cập mới (Private league)**
```
POST /league/{leagueId}/generate-token
Authorization: Bearer {accessToken}
Permission: Chỉ owner
Response Success (200):
json
{
  "message": "Tạo mã truy cập mới thành công!",
  "accessToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

---

### **2.11. Đổi chế độ Public/Private**
```
PUT /league/{leagueId}/visibility
Authorization: Bearer {accessToken}
Content-Type: application/json
Request Body:
json
{
  "visibility": "private"
}
Response Success (200):
json
{
  "message": "Đã chuyển giải đấu sang chế độ riêng tư!",
  "league": {
    "_id": "...",
    "visibility": "private",
    "accessToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    ...
  }
}
```

---

## 3️⃣ TEAM MODULE (Quản lý Đội bóng)

### **3.1. Thêm đội vào giải**
```
POST /team/create
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
Permission: Chỉ owner giải
Form Data:
•	name: Manchester United (text, required)
•	shortName: MUN (text, required, 2-5 chars, uppercase)
•	leagueId: 674d5678... (text, required)
•	group: A (text, optional - cho group-stage)
•	logo: file.jpg (file, optional, max 5MB)
Response Success (201):
json
{
  "message": "Thêm đội thành công!",
  "team": {
    "_id": "674d9012...",
    "name": "Manchester United",
    "shortName": "MUN",
    "logo": "https://res.cloudinary.com/.../logo.jpg",
    "league": "674d5678...",
    "group": null,
    "stats": {
      "played": 0,
      "won": 0,
      "drawn": 0,
      "lost": 0,
      "goalsFor": 0,
      "goalsAgainst": 0,
      "goalDifference": 0,
      "points": 0
    },
    "form": [],
    "createdAt": "2024-12-06T11:00:00.000Z",
    "updatedAt": "2024-12-06T11:00:00.000Z"
  }
}
Response Error (400):
json
{
  "message": "Giải đấu đã đủ 6 đội!"
}
// hoặc
{
  "message": "Tên đội đã tồn tại trong giải đấu này!"
}
```

---

### **3.2. Lấy danh sách đội trong giải**
```
GET /team/league/{leagueId}
Response Success (200):
json
{
  "message": "Danh sách đội",
  "total": 6,
  "teams": [
    {
      "_id": "674d9012...",
      "name": "Manchester United",
      "shortName": "MUN",
      "logo": "...",
      "league": {...},
      "group": null,
      "stats": {
        "played": 3,
        "won": 2,
        "drawn": 1,
        "lost": 0,
        "goalsFor": 8,
        "goalsAgainst": 3,
        "goalDifference": 5,
        "points": 7
      },
      "form": ["W", "D", "W"]
    },
    // ... more teams
  ]
}
```

---

### **3.3. Lấy danh sách đội theo bảng**
```
GET /team/league/{leagueId}?group=A
Response Success (200):
json
{
  "message": "Danh sách đội",
  "total": 4,
  "teams": [
    // Chỉ teams trong bảng A
  ]
}
```

---

### **3.4. Chi tiết đội**
```
GET /team/{teamId}
Response Success (200):
json
{
  "message": "Chi tiết đội",
  "team": {
    "_id": "674d9012...",
    "name": "Manchester United",
    "shortName": "MUN",
    "logo": "...",
    "league": {
      "_id": "674d5678...",
      "name": "Giải Bóng Đá Phủi 2024",
      "type": "round-robin",
      "visibility": "public"
    },
    "group": null,
    "stats": {...},
    "form": ["W", "W", "D", "W", "L"]
  }
}
```

---

### **3.5. Cập nhật đội**
```
PUT /team/{teamId}
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
Permission: Chỉ owner giải
Form Data:
•	name: Manchester United FC (text, optional)
•	shortName: MUFC (text, optional)
•	group: B (text, optional)
•	logo: file.jpg (file, optional)
Response Success (200):
json
{
  "message": "Cập nhật đội thành công!",
  "team": {...}
}
```

---

### **3.6. Xóa đội**
```
DELETE /team/{teamId}
Authorization: Bearer {accessToken}
Permission: Chỉ owner giải
Response Success (200):
json
{
  "message": "Xóa đội thành công!"
}
```

---

### **3.7. Phân bảng tự động (Group-Stage)**
```
POST /team/assign-groups/{leagueId}
Authorization: Bearer {accessToken}
Permission: Chỉ owner giải
Requirements:
•	Giải phải là group-stage
•	Đủ số đội (numberOfTeams)
•	Các đội chưa được phân bảng
Response Success (200):
json
{
  "message": "Phân bảng thành công!",
  "groups": {
    "A": [
      {
        "_id": "674d9012...",
        "name": "Team 1",
        "group": "A"
      },
      {
        "_id": "674d9013...",
        "name": "Team 2",
        "group": "A"
      },
      // ... 2 teams nữa
    ],
    "B": [
      {
        "_id": "674d9014...",
        "name": "Team 5",
        "group": "B
" }, // ... 3 teams nữa ], "C": [...] }, "teams": [...] }
### **3.8. Reset phân bảng**
POST /team/reset-groups/{leagueId} Authorization: Bearer {accessToken}

**Permission:** Chỉ owner giải

**Response Success (200):**
```json
{
  "message": "Đã reset phân bảng thành công!"
}
```

---

## 4️⃣ MATCH MODULE (Quản lý Trận đấu)

### **4.1. Tạo lịch thi đấu tự động**
POST /match/generate-schedule/{leagueId} Authorization: Bearer {accessToken}

**Permission:** Chỉ owner giải

**Requirements:**
- Đủ số đội (numberOfTeams)
- Nếu group-stage: Đã phân bảng xong
- Chưa có lịch thi đấu

**Response Success (201):**
```json
{
  "message": "Tạo lịch thi đấu thành công!",
  "totalMatches": 15,
  "totalRounds": 5,
  "matches": [
    {
      "_id": "674d3456...",
      "league": "674d5678...",
      "homeTeam": "674d9012...",
      "awayTeam": "674d9013...",
      "round": 1,
      "matchNumber": 1,
      "group": null,
      "score": {
        "home": 0,
        "away": 0
      },
      "status": "scheduled",
      "scheduledDate": null,
      "playedDate": null,
      "venue": null,
      "referee": null,
      "videoUrl": null,
      "highlightVideos": [],
      "photos": [],
      "notes": null
    },
    // ... 14 trận nữa
  ]
}
```

**Giải thích:**
- 6 đội → 15 trận (mỗi đội gặp 5 đội còn lại)
- 5 vòng đấu (round 1 → round 5)
- 3 trận/vòng

---

### **4.2. Lấy danh sách trận đấu**
GET /match/league/{leagueId}

**Response Success (200):**
```json
{
  "message": "Danh sách trận đấu",
  "total": 15,
  "matches": [
    {
      "_id": "674d3456...",
      "homeTeam": {
        "_id": "674d9012...",
        "name": "Manchester United",
        "shortName": "MUN",
        "logo": "..."
      },
      "awayTeam": {
        "_id": "674d9013...",
        "name": "Chelsea",
        "shortName": "CHE",
        "logo": "..."
      },
      "league": {
        "_id": "674d5678...",
        "name": "Giải Bóng Đá Phủi 2024",
        "type": "round-robin"
      },
      "round": 1,
      "matchNumber": 1,
      "score": {
        "home": 3,
        "away": 1
      },
      "status": "finished",
      "scheduledDate": "2024-12-15T15:00:00.000Z",
      "playedDate": "2024-12-15T16:45:00.000Z"
    },
    // ... more matches
  ]
}
```

---

### **4.3. Lọc trận đấu theo vòng**
GET /match/league/{leagueId}?round=1

**Response:** Chỉ trả về trận vòng 1

---

### **4.4. Lọc trận đấu theo bảng**
GET /match/league/{leagueId}?group=A

**Response:** Chỉ trả về trận trong bảng A

---

### **4.5. Lọc trận đấu theo trạng thái**
GET /match/league/{leagueId}?status=finished

**Response:** Chỉ trả về trận đã kết thúc

---

### **4.6. Chi tiết trận đấu**
GET /match/{matchId}

**Response Success (200):**
```json
{
  "message": "Chi tiết trận đấu",
  "match": {
    "_id": "674d3456...",
    "homeTeam": {
      "_id": "674d9012...",
      "name": "Manchester United",
      "shortName": "MUN",
      "logo": "...",
      "stats": {
        "played": 3,
        "won": 2,
        "drawn": 1,
        "lost": 0,
        "goalsFor": 8,
        "goalsAgainst": 3,
        "goalDifference": 5,
        "points": 7
      },
      "form": ["W", "D", "W"]
    },
    "awayTeam": {
      "_id": "674d9013...",
      "name": "Chelsea",
      "shortName": "CHE",
      "logo": "...",
      "stats": {...},
      "form": ["L", "W", "W"]
    },
    "league": {...},
    "round": 1,
    "matchNumber": 1,
    "group": null,
    "score": {
      "home": 3,
      "away": 1
    },
    "status": "finished",
    "scheduledDate": "2024-12-15T15:00:00.000Z",
    "playedDate": "2024-12-15T16:45:00.000Z",
    "venue": "Sân Mỹ Đình",
    "referee": "Nguyễn Văn A",
    "videoUrl": "https://youtube.com/watch?v=...",
    "highlightVideos": [
      {
        "_id": "674d7890...",
        "url": "https://res.cloudinary.com/.../goal1.mp4",
        "title": "Bàn thắng của Rashford phút 15",
        "uploadedAt": "2024-12-15T17:00:00.000Z"
      },
      {
        "_id": "674d7891...",
        "url": "https://res.cloudinary.com/.../goal2.mp4",
        "title": "Penalty của Bruno phút 32",
        "uploadedAt": "2024-12-15T17:05:00.000Z"
      }
    ],
    "photos": [
      "https://res.cloudinary.com/.../photo1.jpg",
      "https://res.cloudinary.com/.../photo2.jpg"
    ],
    "notes": "Trận cầu tâm điểm vòng 1"
  }
}
```

---

### **4.7. Cập nhật kết quả trận đấu**
PUT /match/{matchId}/result Authorization: Bearer {accessToken} Content-Type: application/json

**Permission:** Chỉ owner giải

**Request Body:**
```json
{
  "homeScore": 3,
  "awayScore": 1
}
```

**Auto-calculation:**
- ✅ Tự động tính điểm (Thắng +3, Hòa +1, Thua 0)
- ✅ Tự động update stats (played, won, drawn, lost, goals, goalDifference, points)
- ✅ Tự động update form (W/D/L - 5 trận gần nhất)
- ✅ Đổi status → "finished"
- ✅ Set playedDate = now

**Response Success (200):**
```json
{
  "message": "Cập nhật kết quả thành công!",
  "match": {
    "_id": "674d3456...",
    "homeTeam": {
      "name": "Manchester United",
      "stats": {
        "played": 1,
        "won": 1,
        "drawn": 0,
        "lost": 0,
        "goalsFor": 3,
        "goalsAgainst": 1,
        "goalDifference": 2,
        "points": 3
      },
      "form": ["W"]
    },
    "awayTeam": {
      "name": "Chelsea",
      "stats": {
        "played": 1,
        "won": 0,
        "drawn": 0,
        "lost": 1,
        "goalsFor": 1,
        "goalsAgainst": 3,
        "goalDifference": -2,
        "points": 0
      },
      "form": ["L"]
    },
    "score": {
      "home": 3,
      "away": 1
    },
    "status": "finished",
    "playedDate": "2024-12-06T12:00:00.000Z"
  }
}
```

---

### **4.8. Cập nhật thông tin trận**
PUT /match/{matchId}/info Authorization: Bearer {accessToken} Content-Type: application/json

**Permission:** Chỉ owner giải

**Request Body:**
```json
{
  "scheduledDate": "2024-12-15T15:00:00",
  "venue": "Sân Mỹ Đình",
  "referee": "Nguyễn Văn A",
  "notes": "Trận cầu tâm điểm vòng 1"
}
```

**Response Success (200):**
```json
{
  "message": "Cập nhật thông tin trận đấu thành công!",
  "match": {...}
}
```

---

### **4.9. Đổi trạng thái trận**
PUT /match/{matchId}/status Authorization: Bearer {accessToken} Content-Type: application/json

**Permission:** Chỉ owner giải

**Request Body:**
```json
{
  "status": "live"
}
```

**Values:** `scheduled`, `live`, `finished`, `postponed`, `cancelled`

**Response Success (200):**
```json
{
  "message": "Cập nhật trạng thái trận đấu thành công!",
  "match": {...}
}
```

---

### **4.10. Thêm video Full Match (YouTube URL)**
PUT /match/{matchId}/video Authorization: Bearer {accessToken} Content-Type: application/json

**Permission:** Chỉ owner giải

**Request Body:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response Success (200):**
```json
{
  "message": "Thêm video full match thành công!",
  "match": {
    "_id": "674d3456...",
    "videoUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    ...
  }
}
```

**Xóa video:**
```json
{
  "videoUrl": null
}
```

---

### **4.11. Upload Highlight Videos (Có title)**
POST /match/{matchId}/highlights Authorization: Bearer {accessToken} Content-Type: multipart/form-data

**Permission:** Chỉ owner giải

**Validation:**
- Mỗi video: Max **20MB** (fix cứng)
- Tổng số video ≤ `score.home + score.away`
- Ví dụ: Tỷ số 3-1 → Tối đa 4 videos

**Form Data (Postman/Thunder Client):**

| KEY | TYPE | VALUE |
|-----|------|-------|
| highlights | File | goal1.mp4 |
| highlights | File | goal2.mp4 |
| highlights | File | goal3.mp4 |
| titles | Text | Bàn thắng của Rashford phút 15 |
| titles | Text | Penalty của Bruno phút 32 |
| titles | Text | Hat-trick của Rashford phút 78 |

**Lưu ý:**
- `highlights`: Chọn type **File**
- `titles`: Chọn type **Text** (nhập nhiều lần)
- Thứ tự phải khớp: video 1 → title 1, video 2 → title 2
- Title là optional, nếu không điền sẽ là `null`

**Response Success (200):**
```json
{
  "message": "Upload highlight thành công!",
  "match": {
    "_id": "674d3456...",
    "score": {
      "home": 3,
      "away": 1
    },
    "highlightVideos": [
      {
        "_id": "674d7890...",
        "url": "https://res.cloudinary.com/.../goal1.mp4",
        "title": "Bàn thắng của Rashford phút 15",
        "uploadedAt": "2024-12-15T17:00:00.000Z"
      },
      {
        "_id": "674d7891...",
        "url": "https://res.cloudinary.com/.../goal2.mp4",
        "title": "Penalty của Bruno phút 32",
        "uploadedAt": "2024-12-15T17:05:00.000Z"
      },
      {
        "_id": "674d7892...",
        "url": "https://res.cloudinary.com/.../goal3.mp4",
        "title": "Hat-trick của Rashford phút 78",
        "uploadedAt": "2024-12-15T17:10:00.000Z"
      }
    ],
    ...
  }
}
```

**Response Error (400) - Vượt quá số bàn thắng:**
```json
{
  "message": "Số video highlight tối đa là 4 (bằng tổng số bàn thắng). Hiện có 0 video."
}
```

---

### **4.12. Xóa 1 highlight video**
DELETE /match/{matchId}/highlights/{highlightId} Authorization: Bearer {accessToken}

**Permission:** Chỉ owner giải

**Response Success (200):**
```json
{
  "message": "Xóa highlight thành công!",
  "match": {...}
}
```

---

### **4.13. Upload Photos trận đấu**
PUT /match/{matchId}/photos Authorization: Bearer {accessToken} Content-Type: multipart/form-data

**Permission:** Chỉ owner giải

**Validation:** Tối đa 10 ảnh

**Form Data:**

| KEY | TYPE | VALUE |
|-----|------|-------|
| photos | File | photo1.jpg |
| photos | File | photo2.jpg |
| photos | File | photo3.jpg |

**Response Success (200):**
```json
{
  "message": "Cập nhật ảnh trận đấu thành công!",
  "match": {
    "_id": "674d3456...",
    "photos": [
      "https://res.cloudinary.com/.../photo1.jpg",
      "https://res.cloudinary.com/.../photo2.jpg",
      "https://res.cloudinary.com/.../photo3.jpg"
    ],
    ...
  }
}
```

---

### **4.14. Reset kết quả 1 trận**
PUT /match/{matchId}/reset Authorization: Bearer {accessToken}

**Permission:** Chỉ owner giải

**Actions:**
- ✅ Reset score về 0-0
- ✅ Reset stats của 2 đội về 0
- ✅ Xóa form
- ✅ Đổi status → "scheduled"
- ✅ Xóa videoUrl, highlightVideos, photos

**Response Success (200):**
```json
{
  "message": "Reset kết quả trận đấu thành công!",
  "match": {
    "_id": "674d3456...",
    "score": {
      "home": 0,
      "away": 0
    },
    "status": "scheduled",
    "playedDate": null,
    "videoUrl": null,
    "highlightVideos": [],
    "photos": []
  }
}
```

---

### **4.15. Reset toàn bộ kết quả giải**
PUT /match/reset-all/{leagueId} Authorization: Bearer {accessToken}

**Permission:** Chỉ owner giải

**Actions:**
- ✅ Reset tất cả matches về 0-0, status = "scheduled"
- ✅ Reset stats của tất cả teams về 0
- ✅ Xóa form của tất cả teams
- ✅ Xóa tất cả videos, photos

**Response Success (200):**
```json
{
  "message": "Reset toàn bộ kết quả giải đấu thành công!",
  "totalMatchesReset": 15
}
```

---

### **4.16. Xóa 1 trận đấu**
DELETE /match/{matchId} Authorization: Bearer {accessToken}

**Permission:** Chỉ owner giải

**Restriction:** Không thể xóa trận đã có kết quả (status = "finished")

**Response Success (200):**
```json
{
  "message": "Xóa trận đấu thành công!"
}
```

**Response Error (400):**
```json
{
  "message": "Không thể xóa trận đấu đã có kết quả! Vui lòng reset kết quả trước."
}
```

---

### **4.17. Xóa toàn bộ lịch thi đấu**
DELETE /match/delete-schedule/{leagueId} Authorization: Bearer {accessToken}

**Permission:** Chỉ owner giải

**Restriction:** Không có trận nào đã finished

**Response Success (200):**
```json
{
  "message": "Xóa lịch thi đấu thành công!",
  "deletedMatches": 15
}
```

**Response Error (400):**
```json
{
  "message": "Không thể xóa lịch vì đã có 5 trận có kết quả! Vui lòng reset toàn bộ kết quả trước."
}
```

---

## 5️⃣ STANDINGS MODULE (Bảng Xếp Hạng)

### **5.1. Xem BXH toàn giải (Round-Robin)**
GET /standings/league/{leagueId}

**Access Control:**
- Public league: Ai cũng xem được
- Private league: Owner hoặc có access token

**Query Params (nếu private):**
- `token`: Access token

**Response Success (200):**
```json
{
  "message": "Bảng xếp hạng",
  "league": {
    "_id": "674d5678...",
    "name": "Giải Bóng Đá Phủi 2024",
    "type": "round-robin"
  },
  "standings": [
    {
      "position": 1,
      "team": {
        "_id": "674d9012...",
        "name": "Manchester United",
        "shortName": "MUN",
        "logo": "..."
      },
      "stats": {
        "played": 3,
        "won": 3,
        "drawn": 0,
        "lost": 0,
        "goalsFor": 10,
        "goalsAgainst": 3,
        "goalDifference": 7,
        "points": 9
      },
      "form": ["W", "W", "W"]
    },
    {
      "position": 2,
      "team": {
        "_id": "674d9013...",
        "name": "Chelsea",
        "shortName": "CHE",
        "logo": "..."
      },
      "stats": {
        "played": 3,
        "won": 2,
        "drawn": 1,
        "lost": 0,
        "goalsFor": 8,
        "goalsAgainst": 4,
        "goalDifference": 4,
        "points": 7
      },
      "form": ["W", "D", "W"]
    },
    // ... 4 teams nữa
  ]
}
```

**Sorting Logic:** Điểm > Hiệu số > Bàn thắng > Tên (A→Z)

---

### **5.2. Xem BXH theo bảng (Group-Stage)**
GET /standings/league/{leagueId}/group/A

**Response Success (200):**
```json
{
  "message": "Bảng xếp hạng bảng A",
  "league": {
    "_id": "674d5678...",
    "name": "Giải Bóng Đá Chia Bảng 2024",
    "type": "group-stage"
  },
  "group": "A",
  "standings": [
    {
      "position": 1,
      "team": {...},
      "stats": {...},
      "form": [...]
    },
    // ... teams khác trong bảng A
  ]
}
```

---

### **5.3. Xem BXH tất cả bảng**
GET /standings/league/{leagueId}/all-groups

**Response Success (200):**
```json
{
  "message": "Bảng xếp hạng tất cả các bảng",
  "league": {...},
  "groups": {
    "A": [
      {
        "position": 1,
        "team": {...},
        "stats": {...},
        "form": [...]
      },
      // ... 3 teams nữa
    ],
    "B": [
      {
        "position": 1,
        "team": {...},
        "stats": {...},
        "form": [...]
      },
      // ... 3 teams nữa
    ],
    "C": [...]
  }
}
```

---

### **5.4. Thống kê tổng quan + Top Rankings**
GET /standings/league/{leagueId}/stats

**Response Success (200):**
```json
{
  "message": "Thống kê giải đấu",
  "league": {
    "_id": "674d5678...",
    "name": "Giải Bóng Đá Phủi 2024",
    "type": "round-robin"
  },
  "stats": {
    "totalTeams": 6,
    "totalMatches": 15,
    "matchesPlayed": 5,
    "matchesRemaining": 10,
    "totalGoals": 23,
    "averageGoalsPerMatch": 4.6
  },
  "topScorers": [
    {
      "position": 1,
      "team": {
        "_id": "674d9012...",
        "name": "Manchester United",
        "shortName": "MUN",
        "logo": "..."
      },
      "stats": {
        "played": 3,
        "goalsFor": 10,
        "goalsAgainst": 3,
        "goalDifference": 7,
        "points": 9
      },
      "form": ["W", "W", "W"]
    },
    // Top 5 đội ghi bàn nhiều nhất
  ],
  "bestDefense": [
    {
      "position": 1,
      "team": {
        "_id": "674d9013...",
        "name": "Chelsea",
        "shortName": "CHE",
        "logo": "..."
      },
      "stats": {
        "played": 3,
        "goalsFor": 8,
        "goalsAgainst": 2,
        "goalDifference": 6,
        "points": 7
      },
      "form": ["W", "D", "W"]
    },
    // Top 5 đội thủ tốt nhất (để thủng lưới ít nhất)
  ],
  "bestForm": [
    {
      "position": 1,
      "team": {
        "_id": "674d9012...",
        "name": "Manchester United",
        "shortName": "MUN",
        "logo": "..."
      },
      "stats": {...},
      "form": ["W", "W", "W", "W", "W"]
    },
    // Top 5 đội phong độ tốt nhất (tính theo form 5 trận)
  ]
}
```

---

### **5.5. Thống kê chi tiết đội**
GET /standings/team/{teamId}

**Response Success (200):**
```json
{
  "message": "Thống kê chi tiết đội",
  "team": {
    "_id": "674d9012...",
    "name": "Manchester United",
    "shortName": "MUN",
    "logo": "...",
    "group": null
  },
  "league": {
    "_id": "674d5678...",
    "name": "Giải Bóng Đá Phủi 2024",
    "type": "round-robin"
  },
  "stats": {
    "played": 5,
    "won": 4,
    "drawn": 1,
    "lost": 0,
    "goalsFor": 15,
    "goalsAgainst": 5,
    "goalDifference": 10,
    "points": 13
  },
  "form": ["W", "W", "D", "W", "W"],
  "detailedStats": {
    "homeMatches": 3,
    "awayMatches": 2,
    "homeWins": 3,
    "awayWins": 1,
    "homeWinRate": "100.0",
    "awayWinRate": "50.0"
  },
  "recentMatches": [
    {
      "_id": "674d3456...",
      "homeTeam": {
        "_id": "674d9012...",
        "name": "Manchester United",
        "shortName": "MUN",
        "logo": "..."
      },
      "awayTeam": {
        "_id": "674d9013...",
        "name": "Chelsea",
        "shortName": "CHE",
        "logo": "..."
      },
      "score": {
        "home": 3,
        "away": 1
      },
      "status": "finished",
      "playedDate": "2024-12-15T16:45:00.000Z"
    },
    // ... 9 trận gần nhất nữa
  ]
}
```

---

## 🎯 WORKFLOW TEST ĐẦY ĐỦ TỪ ĐẦU ĐẾN CUỐI

### **Scenario: Tạo giải Round-Robin 6 đội, đấu xong, xem BXH**

#### **BƯỚC 1: Đăng ký & Đăng nhập**

1. **Register:**
POST /user/register { "username": "admin", "email": "admin@league.com", "password": "Admin@123" }

2. **Login:**
POST /user/login { "email": "admin@league.com", "password": "Admin@123" }

→ **Lưu accessToken:** `eyJhbGc...`

---

#### **BƯỚC 2: Tạo giải đấu**
POST /league/create Authorization: Bearer eyJhbGc... Content-Type: multipart/form-data
name: Giải Bóng Đá Phủi 2024 type: round-robin visibility: public numberOfTeams: 6 startDate: 2024-12-15 endDate: 2024-12-30

→ **Lưu leagueId:** `674d5678...`

---

#### **BƯỚC 3: Thêm 6 đội**

Thêm lần lượt 6 đội:
POST /team/create (6 lần) Authorization: Bearer eyJhbGc...
// Đội 1 name: Manchester United shortName: MUN leagueId: 674d5678...
// Đội 2 name: Chelsea shortName: CHE leagueId: 674d5678...
// ... tương tự cho 4 đội nữa

---

#### **BƯỚC 4: Tạo lịch thi đấu**
POST /match/generate-schedule/674d5678... Authorization: Bearer eyJhbGc...

→ **Kết quả:** 15 trận, 5 vòng

---

#### **BƯỚC 5: Nhập kết quả từng trận**

**Vòng 1 - Trận 1: MUN vs CHE (3-1)**
PUT /match/{matchId}/result Authorization: Bearer eyJhbGc... { "homeScore": 3, "awayScore": 1 }

**Thêm video Full Match:**
PUT /match/{matchId}/video Authorization: Bearer eyJhbGc... { "videoUrl": "https://youtube.com/watch?v=..." }

**Upload 4 highlight videos (3+1 bàn thắng):**
POST /match/{matchId}/highlights Authorization: Bearer eyJhbGc... Content-Type: multipart/form-data
highlights: goal1.mp4 highlights: goal2.mp4 highlights: goal3.mp4 highlights: goal4.mp4 titles: Rashford mở tỷ số phút 15 titles: Bruno nhân đôi cách biệt phút 32 titles: Rashford lập cú đúp phút 68 titles: Sterling gỡ 1 bàn phút 85

**Upload photos:**
PUT /match/{matchId}/photos Authorization: Bearer eyJhbGc...
photos: photo1.jpg photos: photo2.jpg photos: photo3.jpg

→ **Lặp lại cho các trận khác...**

---

#### **BƯỚC 6: Xem BXH**
GET /standings/league/674d5678...

**Kết quả:**
```json
{
  "standings": [
    {
      "position": 1,
      "team": {"name": "Manchester United", "shortName": "MUN"},
      "stats": {
        "played": 5,
        "won": 4,
"drawn": 1, "lost": 0, "goalsFor": 15, "goalsAgainst": 5, "goalDifference": 10, "points": 13 }, "form": ["W", "W", "D", "W", "W"] }, // ... 5 đội khác
#### **BƯỚC 7: Xem thống kê**
GET /standings/league/674d5678.../stats

→ Xem Top Scorers, Best Defense, Best Form

---

#### **BƯỚC 8: Xem chi tiết đội**
GET /standings/team/{teamId}

→ Xem stats chi tiết, lịch sử 10 trận

---

## 🔒 PHÂN QUYỀN TÓM TẮT

| Endpoint | Public | Owner | Token |
|----------|--------|-------|-------|
| Register/Login | ✅ | ✅ | ✅ |
| Get Public Leagues | ✅ | ✅ | ✅ |
| View Public League | ✅ | ✅ | ✅ |
| View Private League | ❌ | ✅ | ✅ |
| Create League | ❌ | ✅ | ❌ |
| Update/Delete League | ❌ | ✅ | ❌ |
| CRUD Teams | ❌ | ✅ | ❌ |
| CRUD Matches | ❌ | ✅ | ❌ |
| View Public Standings | ✅ | ✅ | ✅ |
| View Private Standings | ❌ | ✅ | ✅ |

---

## 📌 LƯU Ý QUAN TRỌNG

### **1. Authentication:**
- Access Token hết hạn sau **15 phút** → Dùng Refresh Token để gia hạn
- Refresh Token hết hạn sau **7 ngày** → Phải đăng nhập lại
- Account bị khóa **15 phút** sau 5 lần sai password

### **2. File Upload:**
- **Avatar/Logo:** Max 10MB (JPG, PNG, GIF)
- **Highlight Videos:** Max 20MB/video (MP4, MOV, AVI, MKV)
- **Photos:** Max 10 ảnh/trận, mỗi ảnh max 10MB

### **3. Business Rules:**
- Số video highlight ≤ Tổng bàn thắng
- Không update/delete giải đã completed
- Không xóa trận đã có kết quả (phải reset trước)
- Tên đội/shortName không trùng trong cùng giải

### **4. Auto-calculation:**
- Stats được tính tự động khi update kết quả
- Status giải tự động update theo ngày
- Form tự động update (5 trận gần nhất)

---

## ✅ CHECKLIST TEST API

### **Auth Module:**
- [ ] Register với password yếu → Lỗi
- [ ] Register với email trùng → Lỗi
- [ ] Login sai password 5 lần → Account bị khóa
- [ ] Refresh token hợp lệ → Nhận token mới
- [ ] Logout → RefreshToken bị xóa
- [ ] Update profile với avatar → Upload thành công

### **League Module:**
- [ ] Tạo giải round-robin → Thành công
- [ ] Tạo giải group-stage với numberOfTeams sai → Lỗi
- [ ] Tạo giải với endDate < startDate → Lỗi
- [ ] Update giải đã completed → Lỗi
- [ ] Đổi visibility public → private → Access token được tạo

### **Team Module:**
- [ ] Thêm đội vượt quá numberOfTeams → Lỗi
- [ ] Thêm đội trùng tên → Lỗi
- [ ] Phân bảng tự động khi chưa đủ số đội → Lỗi
- [ ] Phân bảng tự động khi đủ đội → Thành công

### **Match Module:**
- [ ] Tạo lịch khi chưa đủ đội → Lỗi
- [ ] Tạo lịch thành công → Số trận đúng
- [ ] Update kết quả → Stats tự động tính đúng
- [ ] Upload 5 videos cho trận 3-1 → Lỗi (max 4)
- [ ] Upload video 25MB → Lỗi (max 20MB)
- [ ] Xóa trận đã finished → Lỗi
- [ ] Reset trận → Stats về 0

### **Standings Module:**
- [ ] Xem BXH private league không có token → Lỗi
- [ ] Xem BXH với token hợp lệ → Thành công
- [ ] BXH sắp xếp đúng (Điểm > Hiệu số > Bàn thắng)
- [ ] Top Scorers hiển thị đúng








✅ HƯỚNG DẪN TEST API – PRIVATE LEAGUE FLOW (Teams + Matches)
Hai API mới đã được thêm optionalAuth và cơ chế kiểm tra private league:
•	GET /team/league/:leagueId
•	GET /team/:id
•	GET /match/league/:leagueId
•	GET /match/:id
Các API này có thể truy cập theo 2 cách:
________________________________________
🔐 1. TRUY CẬP BẰNG TOKEN USER (Đã đăng nhập)
➤ Khi nào dùng?
•	Khi người dùng là chủ giải đấu (owner)
•	Khi user đã đăng nhập → gửi Authorization: Bearer <accessToken>
➤ Cách test
Bước 1: Login để lấy token
POST /api/v1/user/login
Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Bước 2: Gọi API với header Authorization:
________________________________________
🔵 Ví dụ test – GET TEAMS
GET /api/v1/team/league/67a2b2e9a1c...
Header:
Authorization: Bearer <JWT>
Nếu user là owner → OK
Nếu không phải owner → vẫn cần có query ?token= (mã private)
________________________________________
🔵 Ví dụ test – GET MATCHES
GET /api/v1/match/league/67a2b2e9a1c...
Header:
Authorization: Bearer <JWT>
________________________________________
🔵 Ví dụ test – GET TEAM DETAIL
GET /api/v1/team/67a2c1f3c12...
Header:
Authorization: Bearer <JWT>
________________________________________
🔵 Ví dụ test – GET MATCH DETAIL
GET /api/v1/match/67a31c93f81...
Header:
Authorization: Bearer <JWT>
________________________________________
🔓 2. TRUY CẬP BẰNG ACCESS TOKEN (Dành cho người xem, không đăng nhập)
➤ Khi nào dùng?
•	Người xem không đăng nhập vẫn có thể xem dữ liệu private league
•	Nhưng phải nhập accessToken của giải đấu
➤ Cách test
Chỉ cần thêm query ?token=<accessToken>
________________________________________
🔵 Ví dụ – GET TEAMS
GET /api/v1/team/league/67a2b2e9a1c?token=a1b2c3d4e5f6
🔵 Ví dụ – GET MATCHES
GET /api/v1/match/league/67a2b2e9a1c?token=a1b2c3d4e5f6
🔵 Ví dụ – GET TEAM DETAIL
GET /api/v1/team/67a2c1f3c12?token=a1b2c3d4e5f6
🔵 Ví dụ – GET MATCH DETAIL
GET /api/v1/match/67a31c93f81?token=a1b2c3d4e5f6
________________________________________
🚫 3. TRUY CẬP SAI → KẾT QUẢ
❌ Không gửi header Auth
Và cũng không gửi query ?token=
→ API sẽ trả về:
{
  "message": "Giải đấu này ở chế độ riêng tư. Bạn cần có mã truy cập!"
}
❌ Gửi token sai
GET /team/league/67a2?token=xxxxx
→ Kết quả:
{
  "message": "Giải đấu này ở chế độ riêng tư. Bạn cần có mã truy cập!"
}
________________________________________
📌 4. Tóm tắt cách test (để copy vào tài liệu)
### 🧪 TEST PRIVATE LEAGUE API

Các API /team và /match áp dụng cơ chế bảo vệ cho giải đấu private.
Truy cập được theo 2 cách:

1) Chủ giải (user đã đăng nhập)
   - Gửi Header: Authorization: Bearer <jwt_token>

2) Người xem không đăng nhập
   - Gửi query: ?token=<access_token>

Nếu thiếu hoặc sai token → trả về 403.

### Ví dụ:
GET /api/v1/team/league/:leagueId?token=abc123
GET /api/v1/team/:id?token=abc123

GET /api/v1/match/league/:leagueId
  Authorization: Bearer <JWT>

GET /api/v1/match/:id?token=abc123

