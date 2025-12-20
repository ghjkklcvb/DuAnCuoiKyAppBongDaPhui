# 🔧 Fix: Private League Access Token Issue

## 📋 Vấn đề (Problem)

Khi truy cập giải đấu **private** thông qua màn hình `access-private-league.tsx`, hệ thống lưu token thành công và có thể hiển thị trang chính `[id].tsx`. Tuy nhiên, các trang con (statistics, standings, matches) **KHÔNG lấy được dữ liệu** vì không truyền token vào API calls.

### Nguyên nhân (Root Cause)

Các trang con không load token đã lưu từ AsyncStorage và không truyền token vào service functions khi gọi API.

**❌ Trước khi fix:**
```typescript
// statistics.tsx
const { data: stats } = useQuery({
  queryKey: ['leagueStats', id],
  queryFn: () => standingsService.getLeagueStats(id as string), // ❌ KHÔNG có token
});
```

**✅ Sau khi fix:**
```typescript
// statistics.tsx
const [savedToken, setSavedToken] = useState<string | null>(null);
const [tokenLoaded, setTokenLoaded] = useState(false);

useEffect(() => {
  const loadToken = async () => {
    const token = await getLeagueToken(id as string);
    setSavedToken(token);
    setTokenLoaded(true);
  };
  loadToken();
}, [id]);

const { data: stats } = useQuery({
  queryKey: ['leagueStats', id, savedToken],
  queryFn: () => standingsService.getLeagueStats(id as string, savedToken || undefined), // ✅ CÓ token
  enabled: tokenLoaded, // ✅ Chỉ fetch khi đã load token xong
});
```

## ✅ Giải pháp (Solution)

Đã cập nhật **3 files** để hỗ trợ private leagues:

### 1. `statistics.tsx`
- ✅ Import `useEffect`, `useState`, và `getLeagueToken`
- ✅ Load saved token từ AsyncStorage khi component mount
- ✅ Truyền token vào `standingsService.getLeagueStats()`
- ✅ Thêm `enabled: tokenLoaded` để đảm bảo chỉ fetch khi đã có token

### 2. `standings.tsx`
- ✅ Import `useEffect`, `useState`, và `getLeagueToken`
- ✅ Load saved token từ AsyncStorage
- ✅ Truyền token vào **TẤT CẢ** các service calls:
  - `standingsService.getStandings()`
  - `standingsService.getGroupStandings()`
  - `standingsService.getAllGroupsStandings()`
- ✅ Thêm `enabled: tokenLoaded` cho tất cả queries

### 3. `matches.tsx`
- ✅ Import `useEffect`, `useState`, và `getLeagueToken`
- ✅ Load saved token từ AsyncStorage
- ✅ Truyền token vào `matchService.getMatchesByLeague()`
- ✅ Thêm `enabled: tokenLoaded` để đảm bảo fetch sau khi có token

## 🔄 Flow hoạt động (How it works)

```
1. User nhập mã truy cập ở access-private-league.tsx
   └─> Token được lưu vào AsyncStorage (key: `league_token_${leagueId}`)
   └─> Navigate đến /league/[id]

2. Tại [id].tsx (trang chính)
   └─> Load token từ AsyncStorage
   └─> Fetch league data với token
   └─> Hiển thị thông tin giải đấu ✅

3. User click vào tab "Thống kê", "BXH", hoặc "Trận đấu"
   └─> Navigate đến statistics.tsx / standings.tsx / matches.tsx
   └─> TRƯỚC: ❌ Không load token → API trả về 403 Forbidden
   └─> SAU:   ✅ Load token từ AsyncStorage → API trả về data thành công

4. Data được hiển thị đầy đủ ✅
```

## 🧪 Testing

Để test fix này:

1. **Tạo một giải private:**
   - Đăng nhập
   - Tạo giải với visibility = "private"
   - Copy access token

2. **Test từ guest mode:**
   - Logout
   - Vào màn hình "Truy cập giải riêng tư"
   - Paste access token
   - Verify có thể vào được giải
   - **Click vào từng tab:** Thống kê, BXH, Trận đấu
   - ✅ Tất cả phải hiển thị data (không còn lỗi)

## 📝 Files Changed

1. `MyApp/app/league/[id]/statistics.tsx`
2. `MyApp/app/league/[id]/standings.tsx`
3. `MyApp/app/league/[id]/matches.tsx`

## 🔐 Security Note

Token được lưu an toàn trong AsyncStorage và chỉ được sử dụng cho giải đấu tương ứng. Token sẽ được tự động attach vào query string khi gọi API: `?token=${savedToken}`
