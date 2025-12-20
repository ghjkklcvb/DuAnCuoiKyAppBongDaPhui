# ⚽ TÀI LIỆU HỆ THỐNG QUẢN LÝ TRẬN ĐẤU - TIẾNG VIỆT

## 📌 MỤC LỤC

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Cấu Trúc Files](#2-cấu-trúc-files)
3. [Components UI](#3-components-ui)
4. [Các Màn Hình Chính](#4-các-màn-hình-chính)
5. [API Services](#5-api-services)
6. [Luồng Dữ Liệu](#6-luồng-dữ-liệu)
7. [Quy Tắc Nghiệp Vụ](#7-quy-tắc-nghiệp-vụ)

---

## 1. TỔNG QUAN HỆ THỐNG

### 🎯 Mục đích
Hệ thống quản lý trận đấu cho phép chủ giải tạo lịch thi đấu tự động, cập nhật kết quả, upload video/ảnh, và tự động tính toán thống kê cho đội bóng.

### ✨ Tính năng chính
- **Tạo lịch tự động**: Thuật toán Round-Robin tự động tạo lịch đấu
- **Cập nhật trực tiếp**: Nhập tỷ số với UI dễ dùng (nút +/-)
- **Upload media**: Video highlights, video full match, và ảnh
- **Tự động tính toán**: Stats, điểm, BXH tự động cập nhật
- **Filter thông minh**: Lọc theo vòng đấu, trạng thái
- **Responsive UI**: Background gradient đẹp, animation mượt

---

## 2. CẤU TRÚC FILES

```
📁 components/match/
├── MatchBackground.tsx      # Background gradient cho match screens
└── MatchCard.tsx           # Card hiển thị 1 trận đấu

📁 app/match/
├── [id].tsx               # Trang chi tiết trận đấu  
└── [id]/
    ├── update-result.tsx  # Màn hình cập nhật tỷ số
    ├── edit-info.tsx     # Sửa thông tin (ngày, sân, trọng tài)
    ├── upload-photos.tsx # Upload ảnh trận đấu
    └── upload-videos.tsx # Upload video highlights

📁 app/league/[id]/
├── matches.tsx           # Danh sách trận đấu (có filter)
└── generate-schedule.tsx # Tạo lịch thi đấu tự động

📁 services/
└── match.ts             # API service cho match
```

---

## 3. COMPONENTS UI

### A. MatchBackground Component

**File:** `components/match/MatchBackground.tsx`

**Chức năng:**
- Tạo background gradient màu đỏ chuyên nghiệp
- Dùng ảnh `Background_4.jpg` làm nền
- Overlay gradient 2 lớp tạo chiều sâu

**Cách hoạt động:**
```tsx
<View>
  {/* Lớp 1: Ảnh nền */}
  <Image source={Background_4.jpg} />
  
  {/* Lớp 2: Main gradient (đỏ đậm → đỏ nhạt) */}
  <LinearGradient colors={[
    'rgba(221,27,73,0.84)',  // Đỏ đậm trên
    'rgba(100,15,35,0.60)'   // Đỏ nhạt dưới
  ]} />
  
  {/* Lớp 3: Accent gradient (tạo depth) */}
  <LinearGradient diagonal={true} />
  
  {/* Lớp 4: Nội dung */}
  {children}
</View>
```

**Tại sao dùng 2 gradient?**
- Main gradient: Tạo màu nền chính
- Accent gradient: Thêm chiều sâu, tránh flat

---

### B. MatchCard Component

**File:** `components/match/MatchCard.tsx`

**Chức năng:**
- Hiển thị 1 trận đấu trong danh sách
- Hỗ trợ nhiều trạng thái (Sắp đấu, Live, Kết thúc...)
- Có logo đội, tỷ số, ngày giờ, sân

**Cấu trúc giao diện:**
```
┌─────────────────────────────────┐
│ Vòng 3        [LIVE]  ← Header │
├─────────────────────────────────┤
│  🛡️  MU      3-2     LIV  🔴   │← Teams + Score
│            15:00              │
├─────────────────────────────────┤
│  📍 Sân Mỹ Đình              │← Footer (optional)
└─────────────────────────────────┘
```

**Code mẫu:**
```tsx
<TouchableOpacity onPress={onPress}>
  {/* Header */}
  <View style={header}>
    <Text>Vòng {match.round}</Text>
    <Badge color={statusColor}>{statusText}</Badge>
  </View>
  
  {/* Main Content */}
  <View style={matchContent}>
    {/* Home Team */}
    <View style={team}>
      <Logo source={homeTeam.logo} />
      <Text>{homeTeam.name}</Text>
    </View>
    
    {/* Score hoặc VS */}
    <View style={scoreContainer}>
      {match.status === 'finished' ? (
        <Text>{homeScore} - {awayScore}</Text>
      ) : (
        <Text>VS</Text>
      )}
      <Text>{time}</Text>
    </View>
    
    {/* Away Team */}
    <View style={team}>
      <Logo source={awayTeam.logo} />
      <Text>{awayTeam.name}</Text>
    </View>
  </View>
  
  {/* Footer (nếu có venue) */}
  {venue && <Text>📍 {venue}</Text>}
</TouchableOpacity>
```

**Xử lý status:**

| Status | Color | Text | Hiển thị |
|--------|-------|------|----------|
| `scheduled` | Xám | "Sắp đấu" | VS + Ngày giờ |
| `live` | Đỏ | "LIVE" | Tỷ số hiện tại |
| `finished` | Xanh | "KT" | Tỷ số cuối |
| `postponed` | Vàng | "Hoãn" | Ngày giờ cũ |
| `cancelled` | Đỏ tối | "Hủy" | - |

---

## 4. CÁC MÀN HÌNH CHÍNH

### A. Chi Tiết Trận Đấu (`app/match/[id].tsx`)

**Chức năng:**
- Hiển thị đầy đủ thông tin 1 trận đấu
- Chỉ **chủ giải** mới thấy nút quản lý
- Phát video, hiển thị ảnh

**Các phần chính:**

#### 1. Match Header Card
```tsx
┌────────────────────────────────┐
│         VÒNG 3               │
│                                  │
│  🛡️  MANCHESTER UTD             │
│         52                      │
│      3  -  2                   │
│         68                      │
│  🔴  LIVERPOOL                  │
└────────────────────────────────┘
```

**Code:**
```tsx
<View style={matchHeaderCard}>
  <Text>Vòng {match.round}</Text>
  
  <View style={teamsContainer}>
    {/* Home Team */}
    <View style={teamSection}>
      <Image source={homeTeam.logo} style={bigLogo} />
      <Text style={teamName}>{homeTeam.name}</Text>
    </View>
    
    {/* Score */}
    <View style={scoreSection}>
      {match.status === 'finished' ? (
        <View style={scoreDisplay}>
          <Text style={scoreNum}>{homeScore}</Text>
          <Text style={scoreSep}>-</Text>
          <Text style={scoreNum}>{awayScore}</Text>
        </View>
      ) : (
        <Text style={vsText}>VS</Text>
      )}
    </View>
    
    {/* Away Team */}
    <View style={teamSection}>
      <Image source={awayTeam.logo} style={bigLogo} />
      <Text style={teamName}>{awayTeam.name}</Text>
    </View>
  </View>
</View>
```

#### 2. Match Info Card
```tsx
<View style={infoCard}>
  {/* Ngày giờ */}
  <View style={infoRow}>
    <Icon name="calendar" />
    <Text>{formatDate(scheduledDate)}</Text>
  </View>
  
  {/* Sân */}
  {venue && (
    <View style={infoRow}>
      <Icon name="location" />
      <Text>{venue}</Text>
    </View>
  )}
  
  {/* Trọng tài */}
  {referee && (
    <View style={infoRow}>
      <Icon name="person" />
      <Text>Trọng tài: {referee}</Text>
    </View>
  )}
  
  {/* Ghi chú */}
  {notes && (
    <View style={infoRow}>
      <Icon name="document-text" />
      <Text>{notes}</Text>
    </View>
  )}
</View>
```

#### 3. Media Sections

**Video Full Match:**
```tsx
{match.videoUrl && (
  <TouchableOpacity onPress={() => openVideo(match.videoUrl)}>
    <Icon name="play-circle" size={40} color="red" />
    <Text>Xem video full trận</Text>
  </TouchableOpacity>
)}
```

**Highlight Videos:**
```tsx
{match.highlightVideos?.map((highlight) => (
  <VideoPlayer
    key={highlight._id}
    uri={highlight.url}
    title={highlight.title}  // VD: "Bàn thắng Rashford phút 15"
  />
))}
```

**Photos Grid:**
```tsx
<View style={photoGrid}>
  {match.photos?.map((photo, index) => (
    <Image
      key={index}
      source={{ uri: photo }}
      style={photoStyle}  // width: 48%, aspect 1:1
    />
  ))}
</View>
```

#### 4. Owner Actions (Chỉ chủ giải)
```tsx
{isOwner && (
  <View style={ownerActions}>
    {/* Nút chính: Update Result */}
    <TouchableOpacity
      style={primaryButton}
      onPress={() => router.push(`/match/${id}/update-result`)}
    >
      <Text>
        {match.status === 'finished' ? 'Sửa kết quả' : 'Cập nhật kết quả'}
      </Text>
    </TouchableOpacity>
    
    {/* Grid 4 nút phụ */}
    <View style={actionGrid}>
      <ActionButton
        icon="create"
        label="Sửa thông tin"
        onPress={() => router.push(`/match/${id}/edit-info`)}
      />
      <ActionButton
        icon="camera"
        label="Upload"
        onPress={() => router.push(`/match/${id}/upload-photos`)}
      />
      <ActionButton
        icon="videocam"
        label="Video"
        onPress={() => router.push(`/match/${id}/upload-videos`)}
      />
      <ActionButton
        icon="settings"
        label="Trạng thái"
        onPress={() => router.push(`/match/${id}/status`)}
      />
    </View>
  </View>
)}
```

**Kiểm tra quyền owner:**
```tsx
// Load league data
const { data: league } = useQuery({
  queryKey: ['league', match.league],
  queryFn: () => leagueService.getLeagueById(match.league),
});

// Extract owner ID
const leagueOwnerId = typeof league?.owner === 'object' 
  ? league.owner._id 
  : league?.owner;

// Check permission
const isOwner = user?._id && leagueOwnerId && user._id === leagueOwnerId;
```

---

### B. Update Result (`app/match/[id]/update-result.tsx`)

**Chức năng:**
- Nhập tỷ số trận đấu
- Nút +/- dễ dùng
- Tự động tính stats khi submit

**Giao diện:**
```
┌────────────────────────────┐
│  MANCHESTER UNITED       │
│    ⊖   [3]   ⊕          │← Nút -/+ cho Home
├────────────────────────────┤
│        VS                  │
├────────────────────────────┤
│  LIVERPOOL               │
│    ⊖   [2]   ⊕          │← Nút -/+ cho Away
└────────────────────────────┘

┌────────────────────────────┐
│ ℹ️ Tính toán tự động:     │
│ ✓ Điểm: Thắng +3, Hòa +1 │
│ ✓ Stats: W/D/L, Goals    │
│ ✓ Form: 5 trận gần nhất  │
└────────────────────────────┘

      [Cập nhật kết quả]
```

**Code:**
```tsx
export default function UpdateResultScreen() {
  const { id } = useLocalSearchParams();
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');
  
  // Load existing scores
  useEffect(() => {
    if (match) {
      setHomeScore(match.score?.home?.toString() || '0');
      setAwayScore(match.score?.away?.toString() || '0');
    }
  }, [match]);
  
  // Score Input Component
  const ScoreInput = ({ value, onChange, label }) => (
    <View style={scoreInputSection}>
      <Text>{label}</Text>
      
      {/* Decrease Button */}
      <TouchableOpacity
        onPress={() => onChange(Math.max(0, parseInt(value) - 1))}
      >
        <Icon name="remove-circle" size={32} color="red" />
      </TouchableOpacity>
      
      {/* Input Field */}
      <TextInput
        style={scoreInput}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={2}
      />
      
      {/* Increase Button */}
      <TouchableOpacity
        onPress={() => onChange(parseInt(value) + 1)}
      >
        <Icon name="add-circle" size={32} color="red" />
      </TouchableOpacity>
    </View>
  );
  
  // Submit Handler
  const handleSubmit = () => {
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);
    
    Alert.alert(
      'Xác nhận cập nhật',
      `Tỷ số: ${match.homeTeam.name} ${home} - ${away} ${match.awayTeam.name}\n\n` +
      'Stats của các đội sẽ được tính tự động. Tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận',
          onPress: () => updateMutation.mutate({ homeScore: home, awayScore: away })
        }
      ]
    );
  };
  
  // Mutation với cache invalidation
  const updateMutation = useMutation({
    mutationFn: (data) => matchService.updateMatchResult(id, data),
    onSuccess: () => {
      // Refresh TẤT CẢ data liên quan
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      
      Alert.alert('Thành công', 'Đã cập nhật kết quả');
      router.back();
    },
  });
}
```

**Tại sao phải invalidate nhiều queries?**
- `match`: Để cập nhật UI trang chi tiết
- `matches`: Để cập nhật danh sách trận đấu
- `teams`: Vì stats của đội thay đổi
- `standings`: Vì BXH thay đổi
- `statistics`: Vì thống kê giải thay đổi

---

### C. Edit Info (`app/match/[id]/edit-info.tsx`)

**Chức năng:**
- Sửa ngày giờ, sân, trọng tài, ghi chú

**Code:**
```tsx
export default function EditInfoScreen() {
  const [scheduledDate, setScheduledDate] = useState('');
  const [venue, setVenue] = useState('');
  const [referee, setReferee] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Date Picker
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Preserve existing time
      const [hours, minutes] = getTimeFromDate(scheduledDate);
      const formatted = formatDateTime(selectedDate, hours, minutes);
      setScheduledDate(formatted);
    }
  };
  
  // Time Picker
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const formatted = formatDateTime(scheduledDate, selectedTime);
      setScheduledDate(formatted);
    }
  };
  
  return (
    <ScrollView>
      {/* Date/Time Row */}
      <View style={dateTimeRow}>
        {/* Date Button */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Icon name="calendar" />
          <Text>
            {scheduledDate ? formatDate(scheduledDate) : 'Chọn ngày'}
          </Text>
        </TouchableOpacity>
        
        {/* Time Button */}
        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
          <Icon name="time" />
          <Text>
            {scheduledDate ? formatTime(scheduledDate) : 'Chọn giờ'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={scheduledDate ? new Date(scheduledDate) : new Date()}
          mode="date"
          onChange={handleDateChange}
        />
      )}
      
      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={scheduledDate ? new Date(scheduledDate) : new Date()}
          mode="time"
          onChange={handleTimeChange}
        />
      )}
      
      {/* Venue Input */}
      <TextInput
        placeholder="VD: Sân Mỹ Đình"
        value={venue}
        onChangeText={setVenue}
      />
      
      {/* Referee Input */}
      <TextInput
        placeholder="VD: Nguyễn Văn A"
        value={referee}
        onChangeText={setReferee}
      />
      
      {/* Notes TextArea */}
      <TextInput
        placeholder="Ghi chú về trận đấu..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />
      
      {/* Submit Button */}
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Lưu thay đổi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

**Lưu ý quan trọng:**
- **Preserve time khi change date**: Khi user chọn ngày mới, giữ nguyên giờ cũ
- **DateTimePicker platform**: iOS hiển thị inline, Android hiển thị native dialog
- **Format date**: `YYYY-MM-DDTHH:MM` để server hiểu được

---

### D. Upload Photos (`app/match/[id]/upload-photos.tsx`)

**Validation Rules:**
- Max 10 ảnh/trận
- Max 10MB/ảnh
- Format: JPG, PNG, GIF

**Code:**
```tsx
export default function UploadPhotosScreen() {
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  
  // Pick Photos
  const handlePickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    
    if (!result.canceled) {
      // Validation 1: Max 10 photos total
      const currentCount = match?.photos?.length || 0;
      const canAdd = 10 - currentCount;
      
      if (result.assets.length > canAdd) {
        Alert.alert('Lỗi', `Chỉ có thể thêm ${canAdd} ảnh nữa`);
        return;
      }
      
      // Validation 2: Max 10MB per photo
      const oversized = result.assets.filter(
        asset => asset.fileSize && asset.fileSize > 10 * 1024 * 1024
      );
      if (oversized.length > 0) {
        Alert.alert('Lỗi', 'Mỗi ảnh tối đa 10MB');
        return;
      }
      
      setSelectedPhotos(result.assets);
    }
  };
  
  // Upload
  const handleUpload = () => {
    const formData = new FormData();
    selectedPhotos.forEach((photo, index) => {
      formData.append('photos', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `photo_${index}.jpg`,
      });
    });
    
    uploadMutation.mutate(formData);
  };
  
  return (
    <ScrollView>
      {/* Existing Photos */}
      {match?.photos?.length > 0 && (
        <View style={photoGrid}>
          {match.photos.map((photo, i) => (
            <Image key={i} source={{ uri: photo }} style={photoStyle} />
          ))}
        </View>
      )}
      
      {/* Selected Photos (với nút remove) */}
      {selectedPhotos.length > 0 && (
        <View style={photoGrid}>
          {selectedPhotos.map((photo, i) => (
            <View key={i} style={photoContainer}>
              <Image source={{ uri: photo.uri }} style={photoStyle} />
              <TouchableOpacity
                style={removeButton}
                onPress={() => removePhoto(i)}
              >
                <Icon name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Pick Button */}
      <TouchableOpacity onPress={handlePickPhotos}>
        <Text>Chọn ảnh ({match.photos.length}/10)</Text>
      </TouchableOpacity>
      
      {/* Upload Button */}
      {selectedPhotos.length > 0 && (
        <TouchableOpacity onPress={handleUpload}>
          <Text>Upload {selectedPhotos.length} ảnh</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
```

---

### E. Upload Videos (`app/match/[id]/upload-videos.tsx`)

**Quy tắc đặc biệt:**
- **Max videos = Tổng bàn thắng** (homeScore + awayScore)
- VD: Tỷ số 3-2 → Tối đa 5 videos
- Max 20MB/video
- Format: MP4, MOV, AVI, MKV

**Code:**
```tsx
export default function UploadVideosScreen() {
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [titles, setTitles] = useState([]);
  
  const maxVideos = (match?.score?.home || 0) + (match?.score?.away || 0);
  
  // Pick Videos
  const handlePickVideos = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
      multiple: true,
    });
    
    if (!result.canceled) {
      // Validation 1: Max = Total goals
      const currentCount = match?.highlightVideos?.length || 0;
      const canAdd = maxVideos - currentCount;
      
      if (result.assets.length > canAdd) {
        Alert.alert(
          'Lỗi',
          `Chỉ có thể thêm ${canAdd} video nữa (tổng bàn thắng: ${maxVideos})`
        );
        return;
      }
      
      // Validation 2: Max 20MB per video
      const oversized = result.assets.filter(
        file => file.size && file.size > 20 * 1024 * 1024
      );
      if (oversized.length > 0) {
        Alert.alert('Lỗi', 'Mỗi video tối đa 20MB');
        return;
      }
      
      // Validation 3: Video format only
      const invalidFormat = result.assets.filter(
        file => file.mimeType && !file.mimeType.startsWith('video/')
      );
      if (invalidFormat.length > 0) {
        Alert.alert('Lỗi', 'Chỉ chấp nhận file video');
        return;
      }
      
      setSelectedVideos(result.assets);
      setTitles(new Array(result.assets.length).fill(''));
    }
  };
  
  // Upload
  const handleUpload = () => {
    const formData = new FormData();
    
    // Append videos
    selectedVideos.forEach((video) => {
      formData.append('highlights', {
        uri: video.uri,
        type: 'video/mp4',
        name: video.name || 'video.mp4',
      });
    });
    
    // Append titles
    titles.forEach((title) => {
      formData.append('titles', title || '');
    });
    
    uploadMutation.mutate(formData);
  };
  
  return (
    <ScrollView>
      {/* Title Inputs */}
      {selectedVideos.map((video, i) => (
        <View key={i}>
          <Text>Title video {i + 1}:</Text>
          <TextInput
            placeholder="VD: Bàn thắng của Rashford phút 15"
            value={titles[i]}
            onChangeText={(text) => {
              const newTitles = [...titles];
              newTitles[i] = text;
              setTitles(newTitles);
            }}
          />
        </View>
      ))}
      
      {/* Pick Button */}
      <TouchableOpacity onPress={handlePickVideos}>
        <Text>
          Chọn video highlights ({match.highlightVideos.length}/{maxVideos})
        </Text>
      </TouchableOpacity>
      
      {/* Upload Button */}
      {selectedVideos.length > 0 && (
        <TouchableOpacity onPress={handleUpload}>
          <Text>Upload {selectedVideos.length} video</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
```

**Giải thích quy tắc:**
- **Tại sao max videos = goals?** Mỗi bàn thắng nên có 1 highlight video
- **Có thể upload ít hơn?** Được, không bắt buộc phải đủ
- **Thay đổi tỷ số thì sao?** Max videos sẽ tự động cập nhật

---

### F. Matches List (`app/league/[id]/matches.tsx`)

**Chức năng:**
- Hiển thị danh sách tất cả trận đấu
- Filter theo vòng đấu, trạng thái
- Navigate đến chi tiết, BXH

**Filter UI:**
```
┌───────────────────────────────┐
│ Vòng đấu:                   │
│ [Tất cả] [Vòng 1] [Vòng 2]  │← Horizontal scroll
├───────────────────────────────┤
│ Trạng thái:                  │
│ [Tất cả] [Sắp đấu]          │← Wrap layout
│ [Đang đấu] [Đã đấu]         │
└───────────────────────────────┘
```

**Code:**
```tsx
export default function MatchesListScreen() {
  const id = useLeagueId();
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  
  // Query 1: All matches (để lấy rounds)
  const { data: allMatchesData } = useQuery({
    queryKey: ['matches', id],
    queryFn: () => matchService.getMatchesByLeague(id),
    staleTime: 30000,  // Cache 30s
  });
  
  // Query 2: Filtered matches
  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', id, selectedRound, selectedStatus],
    queryFn: () => matchService.getMatchesByLeague(id, undefined, {
      round: selectedRound || undefined,
      status: selectedStatus || undefined,
    }),
    retry: (failureCount, error) => {
      if (error.message?.includes('timeout') && failureCount < 3) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Extract rounds từ all matches
  const rounds = useMemo(() => {
    if (!allMatchesData?.matches) return [];
    return [...new Set(allMatchesData.matches.map(m => m.round))].sort();
  }, [allMatchesData]);
  
  return (
    <LeagueBackground>
      {/* Round Filter */}
      <FlatList
        horizontal
        data={[
          { value: null, label: 'Tất cả' },
          ...rounds.map(r => ({ value: r, label: `Vòng ${r}` }))
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedRound === item.value && styles.filterChipActive
            ]}
            onPress={() => setSelectedRound(item.value)}
          >
            <Text>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      
      {/* Status Filter */}
      <View style={filterRow}>
        <FilterChip
          label="Tất cả"
          active={!selectedStatus}
          onPress={() => setSelectedStatus(null)}
        />
        <FilterChip
          label="Sắp đấu"
          active={selectedStatus === 'scheduled'}
          onPress={() => setSelectedStatus('scheduled')}
        />
        <FilterChip
          label="Đang đấu"
          active={selectedStatus === 'live'}
          onPress={() => setSelectedStatus('live')}
        />
        <FilterChip
          label="Đã đấu"
          active={selectedStatus === 'finished'}
          onPress={() => setSelectedStatus('finished')}
        />
      </View>
      
      {/* Matches List */}
      <FlatList
        data={data?.matches || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => router.push(`/match/${item._id}`)}
          />
        )}
        ListEmptyComponent={(
          <View style={emptyContainer}>
            <Text>
              {isLoading ? 'Đang tải...' :
               error ? 'Không thể tải dữ liệu' :
               'Chưa có trận đấu'}
            </Text>
          </View>
        )}
      />
    </LeagueBackground>
  );
}
```

**Tại sao dùng 2 queries?**
- Query 1 (all matches): Để extract danh sách rounds cho filter
- Query 2 (filtered): Để hiển thị matches theo filter
- Cache riêng biệt để performance tốt hơn

---

### G. Generate Schedule (`app/league/[id]/generate-schedule.tsx`)

**Chức năng:**
- Tạo lịch thi đấu tự động
- Preview trước khi tạo
- Validation đầy đủ

**Công thức tính số trận:**

**Round-Robin:**
```
Công thức: n × (n-1) ÷ 2
VD: 8 đội → 8 × 7 ÷ 2 = 28 trận
```

**Group-Stage:**
```
Công thức: (số bảng) × [(đội/bảng) × (đội/bảng - 1) ÷ 2]
VD: 2 bảng, 4 đội/bảng → 2 × [4 × 3 ÷ 2] = 2 × 6 = 12 trận
```

**Code:**
```tsx
export default function GenerateScheduleScreen() {
  const id = useLeagueId();
  
  // Load data
  const { data: league } = useQuery({
    queryKey: ['league', id],
    queryFn: () => leagueService.getLeagueById(id),
  });
  
  const { data: teams } = useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamService.getTeamsByLeague(id),
  });
  
  // Calculate matches
  const calculateMatches = () => {
    const n = teams?.teams?.length || 0;
    if (league?.type === 'round-robin') {
      return n * (n - 1) / 2;
    }
    const teamsPerGroup = league?.groupSettings?.teamsPerGroup || 0;
    const numberOfGroups = league?.groupSettings?.numberOfGroups || 0;
    return numberOfGroups * (teamsPerGroup * (teamsPerGroup - 1) / 2);
  };
  
  // Handle generate
  const handleGenerate = () => {
    const teamsCount = teams?.teams?.length || 0;
    const requiredTeams = league?.numberOfTeams || 0;
    
    // Validation 1: Enough teams
    if (teamsCount < requiredTeams) {
      Alert.alert(
        'Chưa đủ đội',
        `Cần ${requiredTeams} đội, hiện có ${teamsCount} đội`
      );
      return;
    }
    
    // Validation 2: Group assignment (group-stage only)
    if (league?.type === 'group-stage') {
      const hasUnassigned = teams?.teams?.some(team => !team.group);
      if (hasUnassigned) {
        Alert.alert('Lỗi', 'Cần phân bảng cho tất cả đội trước');
        return;
      }
    }
    
    // Confirmation
    Alert.alert(
      'Xác nhận',
      `Tạo lịch thi đấu sẽ tạo ${calculateMatches()} trận đấu. Tiếp tục?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Tạo lịch', onPress: () => generateMutation.mutate() }
      ]
    );
  };
  
  // Mutation
  const generateMutation = useMutation({
    mutationFn: () => matchService.generateSchedule(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches', id] });
      Alert.alert(
        'Thành công',
        `Đã tạo ${data.totalMatches} trận trong ${data.totalRounds} vòng`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
  });
  
  const totalMatches = calculateMatches();
  const canGenerate = (teams?.teams?.length || 0) >= (league?.numberOfTeams || 0);
  
  return (
    <LeagueBackground>
      <ScrollView>
        {/* Preview Card */}
        <View style={previewCard}>
          <Text style={cardTitle}>Xem trước</Text>
          
          <View style={previewRow}>
            <Text>Thể thức</Text>
            <Text>{league?.type === 'round-robin' ? 'Vòng tròn' : 'Chia bảng'}</Text>
          </View>
          
          <View style={previewRow}>
            <Text>Số đội</Text>
            <Text>{teams?.teams?.length}/{league?.numberOfTeams}</Text>
          </View>
          
          <View style={previewRow}>
            <Text>Tổng số trận</Text>
            <Text style={highlight}>{totalMatches}</Text>
          </View>
          
          {/* Warning */}
          {!canGenerate && (
            <View style={warning}>
              <Text>Cần đủ {league?.numberOfTeams} đội để tạo lịch</Text>
            </View>
          )}
        </View>
        
        {/* Info Card */}
        <View style={infoCard}>
          <Text style={infoTitle}>Lưu ý</Text>
          <View style={bullet}>• Lịch thi đấu sẽ được tạo tự động</View>
          <View style={bullet}>• Mỗi đội gặp nhau 1 lần</View>
          <View style={bullet}>• Có thể cập nhật ngày giờ sau</View>
          <View style={bullet}>• Không thể tạo lại khi đã có trận</View>
        </View>
        
        {/* Generate Button */}
        <TouchableOpacity
          style={[button, !canGenerate && buttonDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate || generateMutation.isPending}
        >
          <Text>
            {generateMutation.isPending ? 'Đang tạo...' : 'Tạo lịch thi đấu'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LeagueBackground>
  );
}
```

---

## 5. API SERVICES

### File: `services/match.ts`

**Các API endpoints:**

```tsx
export const matchService = {
  // 1. Tạo lịch thi đấu tự động
  generateSchedule: async (leagueId: string) => {
    const response = await api.post(`/match/generate-schedule/${leagueId}`);
    return response.data;
  },
  
  // 2. Lấy danh sách trận đấu (có filter)
  getMatchesByLeague: async (
    leagueId: string,
    token?: string,
    filters?: {
      round?: number;
      group?: string;
      status?: string;
    }
  ) => {
    let url = `/match/league/${leagueId}`;
    const params = new URLSearchParams();
    
    if (token) params.append('token', token);  // Private league
    if (filters?.round) params.append('round', filters.round.toString());
    if (filters?.group) params.append('group', filters.group);
    if (filters?.status) params.append('status', filters.status);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  // 3. Lấy chi tiết 1 trận đấu
  getMatchById: async (id: string) => {
    const response = await api.get(`/match/${id}`);
    return response.data.match;
  },
  
  // 4. Cập nhật thông tin trận đấu
  updateMatchInfo: async (id: string, data: {
    scheduledDate?: string;
    venue?: string;
    referee?: string;
    notes?: string;
  }) => {
    const response = await api.patch(`/match/${id}/info`, data);
    return response.data;
  },
  
  // 5. Cập nhật kết quả
  updateMatchResult: async (id: string, data: {
    homeScore: number;
    awayScore: number;
  }) => {
    const response = await api.patch(`/match/${id}/result`, data);
    return response.data;
  },
  
  // 6. Cập nhật trạng thái
  updateMatchStatus: async (id: string, status: string) => {
    const response = await api.patch(`/match/${id}/status`, { status });
    return response.data;
  },
  
  // 7. Cập nhật video full match
  updateMatchVideo: async (id: string, videoUrl: string | null) => {
    const response = await api.patch(`/match/${id}/video`, { videoUrl });
    return response.data;
  },
  
  // 8. Upload highlight videos
  uploadHighlights: async (id: string, formData: FormData) => {
    const response = await api.post(`/match/${id}/highlights`, formData);
    return response.data;
  },
  
  // 9. Xóa 1 highlight
  deleteHighlight: async (matchId: string, highlightId: string) => {
    const response = await api.delete(`/match/${matchId}/highlights/${highlightId}`);
    return response.data;
  },
  
  // 10. Upload photos
  uploadPhotos: async (id: string, formData: FormData) => {
    const response = await api.patch(`/match/${id}/photos`, formData);
    return response.data;
  },
  
  // 11. Reset trận đấu về trạng thái ban đầu
  resetMatch: async (id: string) => {
    const response = await api.patch(`/match/${id}/reset`);
    return response.data;
  },
  
  // 12. Reset TẤT CẢ trận đấu của giải
  resetAllMatches: async (leagueId: string) => {
    const response = await api.patch(`/match/reset-all/${leagueId}`);
    return response.data;
  },
  
  // 13. Xóa 1 trận đấu
  deleteMatch: async (id: string) => {
    const response = await api.delete(`/match/${id}`);
    return response.data;
  },
  
  // 14. Xóa TẤT CẢ lịch thi đấu
  deleteSchedule: async (leagueId: string) => {
    const response = await api.delete(`/match/delete-schedule/${leagueId}`);
    return response.data;
  },
};
```

---

## 6. LUỒNG DỮ LIỆU

### A. Luồng Update Result

```
1. User nhập tỷ số
   ↓
2. Click "Cập nhật kết quả"
   ↓
3. Hiện dialog xác nhận
   ↓
4. User confirm
   ↓
5. Call API: PATCH /match/{id}/result
   ↓
6. Backend tự động tính:
   - Points (W+3, D+1, L+0)
   - Stats (played, won, drawn, lost)
   - Goals (for, against, difference)
   - Form (W/D/L của 5 trận gần nhất)
   ↓
7. API trả về success
   ↓
8. Frontend invalidate caches:
   - match
   - matches
   - teams
   - standings
   - statistics
   ↓
9. React Query auto refetch
   ↓
10. UI cập nhật mới nhất
```

### B. Luồng Upload Media

```
1. User chọn ảnh/video
   ↓
2. Validate file:
   - Size (ảnh 10MB, video 20MB)
   - Format (JPG/PNG/GIF, MP4/MOV)
   - Count (ảnh max 10, video max = goals)
   ↓
3. Preview selected files
   ↓
4. User click Upload
   ↓
5. Create FormData
   ↓
6. Call API: POST /match/{id}/photos hoặc /highlights
   ↓
7. Backend upload to Cloudinary
   ↓
8. API trả về URLs
   ↓
9. Frontend invalidate cache ['match', id]
   ↓
10. UI hiển thị media mới
```

### C. Luồng Generate Schedule

```
1. User vào Generate Schedule screen
   ↓
2. Load league + teams data
   ↓
3. Tính số trận sẽ tạo
   ↓
4. Validate:
   - Đủ số đội?
   - Đã phân bảng? (nếu group-stage)
   ↓
5. User click "Tạo lịch"
   ↓
6. Hiện confirmation dialog
   ↓
7. User confirm
   ↓
8. Call API: POST /match/generate-schedule/{leagueId}
   ↓
9. Backend chạy thuật toán Round-Robin:
   - Tạo n×(n-1)÷2 trận
   - Assign rounds
   - Set status = 'scheduled'
   ↓
10. API trả về: { totalMatches, totalRounds }
   ↓
11. Frontend invalidate ['matches', id]
   ↓
12. Navigate back to matches list
```

---

## 7. QUY TẮC NGHIỆP VỤ

### A. Match Status Workflow

```
          ┌─────────────┐
          │  SCHEDULED  │ ← Mặc định khi tạo lịch
          └─────────────┘
                 │
        ┌────────┼────────┐
        │                 │
        ▼                 ▼
   ┌────────┐       ┌─────────┐
   │  LIVE  │       │POSTPONED│
   └────────┘       └─────────┘
        │                 │
        ▼                 ▼
   ┌────────┐       ┌──────────┐
   │FINISHED│       │ CANCELLED│
   └────────┘       └──────────┘
```

**Rules:**
- `SCHEDULED` → `LIVE`: Khi bắt đầu trận
- `LIVE` → `FINISHED`: Khi kết thúc + nhập tỷ số
- `SCHEDULED` → `POSTPONED`: Khi hoãn trận
- `ANY` → `CANCELLED`: Khi hủy trận

### B. Score Update Auto-calculations

**Khi update tỷ số, backend tự động tính:**

```typescript
// 1. Determine result
if (homeScore > awayScore) {
  homeTeam.stats.won += 1;
  homeTeam.stats.points += 3;
  awayTeam.stats.lost += 1;
  awayTeam.stats.points += 0;
} else if (homeScore < awayScore) {
  awayTeam.stats.won += 1;
  awayTeam.stats.points += 3;
  homeTeam.stats.lost += 1;
  homeTeam.stats.points += 0;
} else {
  homeTeam.stats.drawn += 1;
  homeTeam.stats.points += 1;
  awayTeam.stats.drawn += 1;
  awayTeam.stats.points += 1;
}

// 2. Update goals
homeTeam.stats.played += 1;
homeTeam.stats.goalsFor += homeScore;
homeTeam.stats.goalsAgainst += awayScore;
homeTeam.stats.goalDifference = goalsFor - goalsAgainst;

awayTeam.stats.played += 1;
awayTeam.stats.goalsFor += awayScore;
awayTeam.stats.goalsAgainst += homeScore;
awayTeam.stats.goalDifference = goalsFor - goalsAgainst;

// 3. Update form (last 5 matches)
const homeResult = homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
const awayResult = awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';

updateTeamForm(homeTeam, homeResult);  // Thêm 'W'/'D'/'L' vào form array
updateTeamForm(awayTeam, awayResult);

// 4. Recalculate standings
calculateStandings(leagueId);
```

### C. Media Upload Limits

| Media Type | Max Count | Max Size | Formats |
|------------|-----------|----------|---------|
| **Photos** | 10 | 10MB | JPG, PNG, GIF |
| **Highlight Videos** | = Total Goals | 20MB | MP4, MOV, AVI, MKV |
| **Full Match Video** | 1 (URL only) | - | YouTube/Cloudinary URL |

**Ví dụ:**
```
Tỷ số: 3-2
→ Max photos: 10
→ Max highlights: 5 (3+2 = 5 bàn thắng)
→ Full match: 1 URL
```

### D. Permission System

**Ai được làm gì?**

| Action | Guest | User | League Owner |
|--------|-------|------|--------------|
| Xem trận đấu | ✅ | ✅ | ✅ |
| Xem video/ảnh | ✅ | ✅ | ✅ |
| Cập nhật tỷ số | ❌ | ❌ | ✅ |
| Sửa thông tin | ❌ | ❌ | ✅ |
| Upload media | ❌ | ❌ | ✅ |
| Xóa trận | ❌ | ❌ | ✅ |

**Code kiểm tra:**
```tsx
const isOwner = user?._id && leagueOwnerId && user._id === leagueOwnerId;

// Conditional render
{isOwner && (
  <TouchableOpacity onPress={handleUpdateResult}>
    <Text>Cập nhật kết quả</Text>
  </TouchableOpacity>
)}
```

### E. Cache Invalidation Strategy

**Khi nào invalidate cache nào?**

| Action | Invalidate Caches |
|--------|-------------------|
| Update result | `match`, `matches`, `teams`, `standings`, `statistics` |
| Edit info | `match`, `matches` |
| Upload media | `match` |
| Generate schedule | `matches` |
| Delete match | `matches`, `standings`, `statistics` |

**Tại sao:**
- **match**: Trang chi tiết cần refresh
- **matches**: Danh sách cần cập nhật
- **teams**: Stats đội thay đổi
- **standings**: BXH thay đổi
- **statistics**: Thống kê giải thay đổi

---

## 📚 TÓM TẮT

### ✅ Điểm mạnh của hệ thống

1. **UI/UX chuyên nghiệp**: Background gradient đẹp, animation mượt
2. **Tự động hóa cao**: Tạo lịch tự động, tính stats tự động
3. **Validation chặt chẽ**: Kiểm tra size, format, count cho tất cả upload
4. **Cache thông minh**: React Query với invalidation strategy hợp lý
5. **Permission-based**: Chỉ owner mới thao tác được
6. **Error handling**: Retry logic, graceful fallback

### 🎯 Các luồng chính

1. **Generate Schedule** → Create matches
2. **Update Result** → Auto-calculate stats → Update standings
3. **Upload Media** → Validate → Upload to Cloudinary → Save URLs
4. **Filter Matches** → Smart caching → Display list

### 🔧 Tech Stack

- **UI Framework**: React Native + Expo
- **Navigation**: Expo Router
- **State Management**: React Query
- **API Client**: Axios
- **Media**: ImagePicker, DocumentPicker, Expo AV
- **Date/Time**: @react-native-community/datetimepicker

---

## 🚀 BEST PRACTICES

### 1. Always Invalidate Related Caches
```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['match', id] });
  queryClient.invalidateQueries({ queryKey: ['matches'] });
  queryClient.invalidateQueries({ queryKey: ['teams'] });
  queryClient.invalidateQueries({ queryKey: ['standings'] });
}
```

### 2. Use Optimistic Updates (optional)
```tsx
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: ['match', id] });
  const previousMatch = queryClient.getQueryData(['match', id]);
  queryClient.setQueryData(['match', id], (old) => ({
    ...old,
    score: { home: newData.homeScore, away: newData.awayScore }
  }));
  return { previousMatch };
}
```

### 3. Always Validate Before Upload
```tsx
// Size check
if (file.size > MAX_SIZE) {
  Alert.alert('Lỗi', 'File quá lớn');
  return;
}

// Format check
if (!ALLOWED_FORMATS.includes(file.type)) {
  Alert.alert('Lỗi', 'Format không hợp lệ');
  return;
}
```

### 4. Use useMemo for Heavy Calculations
```tsx
const rounds = useMemo(() => {
  if (!allMatchesData?.matches) return [];
  return [...new Set(allMatchesData.matches.map(m => m.round))].sort();
}, [allMatchesData]);
```

### 5. Implement Proper Error Handling
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['matches', id],
  queryFn: () => matchService.getMatchesByLeague(id),
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

---

**Hết tài liệu. Nếu có thắc mắc, tham khảo code trong các file đã đề cập.**