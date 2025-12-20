# 📖 League Management System - Documentation

## 📁 Tổng Quan Cấu Trúc Files

```
app/league/
├── [id].tsx                    # Trang chi tiết giải đấu (main hub)
├── [id]/
│   ├── matches.tsx            # Danh sách trận đấu
│   ├── statistics.tsx         # Thống kê giải
│   ├── standings.tsx          # Bảng xếp hạng
│   ├── settings.tsx           # Cài đặt giải
│   ├── edit.tsx               # Chỉnh sửa thông tin
│   ├── generate-schedule.tsx  # Tạo lịch thi đấu
│   ├── assign-groups.tsx      # Phân bảng tự động
│   ├── add-team.tsx           # Thêm đội mới
│   └── actions.tsx            # Các hành động nguy hiểm
└── access-private-league.tsx  # Truy cập giải private
```

---

## 🎯 1. TRANG CHỦ GIẢI ĐẤU - `[id].tsx`

### Mục đích
Trang hub chính hiển thị toàn bộ thông tin giải đấu với hệ thống tab.

### Luồng Hoạt Động

```typescript
1. Load token từ AsyncStorage (nếu là giải private)
   ↓
2. Query dữ liệu song song:
   - league info
   - teams
   - matches
   - standings (round-robin) hoặc group standings (group-stage)
   - statistics
   ↓
3. Kiểm tra quyền owner (user._id === league.owner._id)
   ↓
4. Render với 5 tabs: Overview, Teams, Matches, Standings, Statistics
```

### Các Tab Chính

**a) Overview Tab**
- Hiển thị thông tin cơ bản: thể thức, số đội, trạng thái
- Nút quản lý (chỉ owner): Quản lý đội, Quản lý trận, Hành động

**b) Teams Tab**
- Danh sách 3 đội đầu (preview)
- Hiển thị logo, tên, điểm
- Link "Xem tất cả" → `/league/${id}/teams`

**c) Matches Tab**
- 3 trận gần nhất (sắp xếp: Live → Upcoming → Recent)
- Dùng `MatchCard` component
- Link "Xem lịch đấu" → `/league/${id}/matches`

**d) Standings Tab**
- **Round-robin**: Top 3 đội
- **Group-stage**: Top 3 bảng, mỗi bảng 3 đội
- Dùng `StandingsTable` component

**e) Statistics Tab**
- Tổng quan: Trận đã đấu, Bàn thắng, TB bàn/trận
- Top Scorer (tấn công tốt nhất)
- Best Defense (phòng thủ tốt nhất)

### Query Keys
```typescript
['league', id, savedToken]
['teams', id, savedToken]
['matches', id, savedToken]
['standings', id, savedToken]          // round-robin
['group-standings', id, savedToken]    // group-stage
['statistics', id, savedToken]
```

---

## 🎮 2. MATCHES - `[id]/matches.tsx`

### Mục đích
Hiển thị và filter danh sách trận đấu.

### Features

**Filters:**
- **By Round**: Tất cả / Vòng 1, 2, 3...
- **By Status**: Tất cả / Sắp đấu / Đang đấu / Đã đấu

**Data Flow:**
```typescript
1. Load token (private league support)
2. Query allMatchesData → extract rounds
3. Query filtered matches với filters
4. Render với FlatList + MatchCard
```

**Header Actions:**
- Nút "BXH" → Navigate to standings

---

## 📊 3. STATISTICS - `[id]/statistics.tsx`

### Mục đích
Hiển thị thống kê chi tiết của giải đấu.

### Data Structure
```typescript
{
  stats: {
    totalTeams: number
    matchesPlayed: number
    totalGoals: number
    averageGoalsPerMatch: number
  }
  topScorers: Array<{ team, stats: { goalsFor } }>
  bestDefense: Array<{ team, stats: { goalsAgainst } }>
  bestForm: Array<{ team, form: string }>  
}
```

### Sorting Logic
- **Top Scorers**: Sắp theo goalsFor giảm dần
- **Best Defense**: Sắp theo goalsAgainst tăng dần
- **Best Form**: Tính điểm form (W=3, D=1, L=0) → sắp giảm dần

---

## 🏆 4. STANDINGS - `[id]/standings.tsx`

### Mục đích
Hiển thị bảng xếp hạng.

### Modes

**Round-Robin:**
```typescript
- 1 bảng duy nhất
- Query: getStandings(leagueId)
```

**Group-Stage:**
```typescript
- Tab "Tất cả" + Tab cho từng bảng (A, B, C...)
- Query tùy theo tab:
  - Tất cả: getAllGroupsStandings(leagueId)
  - Bảng A: getGroupStandings(leagueId, 'A')
```

---

## ⚙️ 5. SETTINGS - `[id]/settings.tsx`

### Mục đích
Quản lý cài đặt giải đấu (owner only).

### Features

**a) Chế độ hiển thị**
- Switch: Public ↔ Private
- Mutation: `updateVisibility()`

**b) Private League Token** (hiện khi private)
- Hiển thị token hiện tại
- Nút "Sao chép" → Copy link vào clipboard
- Nút "Tạo mới" → Generate token mới (token cũ hết hiệu lực)

**c) Quản lý nội dung**
- Chỉnh sửa thông tin → `/league/${id}/edit`
- Quản lý đội bóng → `/league/${id}/teams`
- Quản lý trận đấu → `/league/${id}/matches`

**d) Vùng nguy hiểm**
- Nút "Xóa giải đấu"
- Không cho xóa nếu status = 'completed'

---

## ✏️ 6. EDIT - `[id]/edit.tsx`

### Mục đích
Chỉnh sửa thông tin giải đấu.

### Editable Fields
- ✅ Tên giải đấu (required, min 3 chars)
- ✅ Mô tả (max 500 chars)
- ✅ Ngày bắt đầu (DateTimePicker)
- ✅ Ngày kết thúc (DateTimePicker)
- ✅ Logo (upload/change/remove)

### Non-Editable (read-only)
- ❌ Thể thức (round-robin / group-stage)
- ❌ Số đội
- ❌ Trạng thái giải

### Logo Management
```typescript
handleChangeLogo() → ImagePicker → FormData → logoMutation
handleRemoveLogo() → FormData { removeLogo: 'true' }
```

---

## 📅 7. GENERATE SCHEDULE - `[id]/generate-schedule.tsx`

### Mục đích
Tạo lịch thi đấu tự động.

### Validation Rules
```typescript
1. Kiểm tra số đội:
   teamsCount >= league.numberOfTeams

2. Group-stage thêm: 
   Tất cả đội phải đã được phân bảng

3. Confirm dialog hiển thị:
   - Số trận sẽ tạo = n*(n-1)/2
```

### Calculation
**Round-robin:**
```
totalMatches = n * (n-1) / 2
Ví dụ: 8 đội → 28 trận
```

**Group-stage:**
```
totalMatches = numberOfGroups * (teamsPerGroup * (teamsPerGroup-1) / 2)
Ví dụ: 2 bảng, 4 đội/bảng → 2 * 6 = 12 trận
```

### Post-Success
- Invalidate `['matches', id]`
- Navigate back
- Alert: "Đã tạo X trận đấu trong Y vòng"

---

## 🎲 8. ASSIGN GROUPS - `[id]/assign-groups.tsx`

### Mục đích
Phân bảng tự động cho giải group-stage.

### Display Info
```typescript
- Số bảng: league.groupSettings.numberOfGroups
- Đội/bảng: league.groupSettings.teamsPerGroup
- Tổng cần: numberOfGroups * teamsPerGroup
- Số đội hiện có: teams.length
```

### Operations

**Assign Groups (Phân bảng)**
```typescript
POST /team/assign-groups/:leagueId
→ Backend random assign teams to groups
→ Invalidate: teams, league, group-standings
```

**Reset Groups**
```typescript
POST /team/reset-groups/:leagueId
→ Clear tất cả group assignments
→ Invalidate: teams, league, group-standings
```

---

## ➕ 9. ADD TEAM - `[id]/add-team.tsx`

### Mục đích
Thêm đội mới vào giải.

### Form Fields
```typescript
{
  name: string           // required, text
  shortName: string      // required, 2-5 chars, uppercase
  logo?: File           // optional, image
  leagueId: string      // auto-filled
}
```

### Validation
```typescript
- name.trim() !== ''
- shortName.length >= 2 && <= 5
- Logo: image/jpeg, 1:1 aspect
```

### FormData Structure
```typescript
const formData = new FormData()
formData.append('name', name)
formData.append('shortName', shortName.toUpperCase())
formData.append('leagueId', id)
if (logo) formData.append('logo', logoFile)
```

---

## ⚠️ 10. ACTIONS - `[id]/actions.tsx`

### Mục đích
Các hành động nguy hiểm cho owner (reset/delete).

### Display Stats
```typescript
- Tổng trận: totalMatches
- Đã đấu: finishedMatches (status === 'finished')
- Còn lại: totalMatches - finishedMatches
```

### Actions

**a) Reset Toàn Bộ Kết Quả**
```typescript
Endpoint: PATCH /match/reset-all/:leagueId

Effects:
- Reset TẤT CẢ trận về 0-0
- Reset stats của TẤT CẢ đội về 0
- Xóa form (W/D/L history)
- Xóa videos & photos
- Set status → 'scheduled'

Enabled: totalMatches > 0
```

**b) Xóa Toàn Bộ Lịch Thi Đấu**
```typescript
Endpoint: DELETE /match/delete-schedule/:leagueId

Effects:
- Xóa vĩnh viễn TẤT CẢ trận đấu
- KHÔNG reset stats

Enabled: totalMatches > 0 && finishedMatches === 0
Disabled nếu: Có trận đã hoàn thành
```

### Mutation Chain
```typescript
onSuccess → invalidate:
  - ['matches', id]
  - ['teams', id]
  - ['standings', id]
  - ['group-standings', id]
  - ['statistics', id]
  - ['league', id]
```

---

## 🔐 11. PRIVATE LEAGUE ACCESS

### Flow

**Step 1: Nhập mã** (`access-private-league.tsx`)
```typescript
1. User paste token: "leagueId:token"
2. parseLeagueLink(linkCode) → { leagueId, token }
3. Verify: getLeagueById(leagueId, token)
4. Success → saveLeagueToken(leagueId, token) to AsyncStorage
5. Navigate: `/league/${leagueId}`
```

**Step 2: Tự động load token** (tất cả các trang con)
```typescript
useEffect(() => {
  const token = await getLeagueToken(id)
  setSavedToken(token)
  setTokenLoaded(true)
}, [id])

useQuery({
  queryKey: ['data', id, savedToken],
  queryFn: () => service.getData(id, savedToken || undefined),
  enabled: tokenLoaded
})
```

### Token Storage
```typescript
Key: `league_token_${leagueId}`
Value: token string
Storage: AsyncStorage
```

---

## 🔄 Query Invalidation Strategy

### Manual Refresh (useFocusEffect)
```typescript
// Tất cả trang đều có:
useFocusEffect(
  useCallback(() => {
    if (tokenLoaded) {
      queryClient.invalidateQueries({ queryKey: ['data', id] })
    }
  }, [queryClient, id, tokenLoaded])
)
```

### After Mutations
```typescript
// Edit league
onSuccess → invalidate: ['league', id]

// Add/Delete team
onSuccess → invalidate: ['teams', id], ['league', id]

// Generate schedule
onSuccess → invalidate: ['matches', id]

// Reset/Delete matches
onSuccess → invalidate: ALL queries

// Assign groups
onSuccess → invalidate: ['teams', id], ['group-standings', id]
```

---

## 📊 Services & API Endpoints

### League Service (`services/league.ts`)
```typescript
getLeagueById(id, token?)          → GET /league/:id?token=
updateLeague(id, data)             → PATCH /league/:id
deleteLeague(id)                   → DELETE /league/:id
updateVisibility(id, visibility)   → PATCH /league/:id/visibility
generateToken(id)                  → POST /league/:id/generate-token
```

### Team Service (`services/team.ts`)
```typescript
getTeamsByLeague(leagueId, token?) → GET /team/league/:leagueId?token=
createTeam(formData)               → POST /team/create
updateTeam(id, formData)           → PATCH /team/:id
deleteTeam(id)                     → DELETE /team/:id
assignGroups(leagueId)             → POST /team/assign-groups/:leagueId
resetGroups(leagueId)              → POST /team/reset-groups/:leagueId
```

### Match Service (`services/match.ts`)
```typescript
getMatchesByLeague(leagueId, token?, filters?) → GET /match/league/:leagueId
generateSchedule(leagueId)         → POST /match/generate-schedule/:leagueId
resetAllMatches(leagueId)          → PATCH /match/reset-all/:leagueId
deleteSchedule(leagueId)           → DELETE /match/delete-schedule/:leagueId
```

### Standings Service (`services/standings.ts`)
```typescript
getStandings(leagueId, token?)           → GET /standings/league/:leagueId
getGroupStandings(leagueId, group, token?) → GET /standings/league/:leagueId/group/:group
getAllGroupsStandings(leagueId, token?)  → GET /standings/league/:leagueId/all-groups
getLeagueStats(leagueId, token?)         → GET /standings/league/:leagueId/stats
```

---

## 🎨 UI Components & Styling

### Shared Styles
```typescript
LeagueBackground         // Gradient background component
Colors.primary          // #B91C3C (Red)
Colors.secondary        // Secondary color
Colors.win              // Green for wins
Colors.draw             // Yellow for draws
```

### Card Style Pattern
```typescript
backgroundColor: 'rgba(70, 22, 22, 0.6)'     // Dark glassmorphism
borderColor: 'rgba(255, 255, 255, 0.15)'
shadowColor: '#4e1a1a44'
```

### Header Style (consistent)
```typescript
headerStyle: { backgroundColor: 'rgba(214, 18, 64, 1)' }
headerTintColor: '#FFFFFF'
headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' }
```

---

## ⚡ Performance Tips

1. **Token Loading**: Chờ tokenLoaded = true trước khi fetch
2. **Auto Refresh**: Dùng useFocusEffect thay vì useEffect
3. **Stale Time**: Set staleTime cho queries ít thay đổi
4. **Parallel Queries**: Query song song khi không phụ thuộc
5. **Query Keys**: Luôn include savedToken để cache riêng

---

## 🔧 Common Patterns

### Owner Check
```typescript
const leagueOwnerId = typeof league?.owner === 'object' 
  ? league.owner._id 
  : league?.owner
const isOwner = user?._id && leagueOwnerId && user._id === leagueOwnerId
```

### Date Formatting
```typescript
new Date(date).toLocaleDateString('vi-VN', {
  day: '2-digit',
  month: '2-digit', 
  year: 'numeric'
})
```

### Form Validation
```typescript
// React Hook Form + Yup
const schema = yup.object({ ... })
const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema)
})
```
