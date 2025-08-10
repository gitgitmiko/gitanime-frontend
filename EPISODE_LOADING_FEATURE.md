# Fitur Loading Episode - GitAnime

## Deskripsi
Fitur ini menambahkan animasi loading yang menarik dan informatif untuk halaman episode, memberikan user experience yang lebih baik saat menunggu data episode dimuat.

## Komponen yang Ditambahkan

### 1. EpisodeLoading Component (`components/EpisodeLoading.js`)
Komponen loading yang menampilkan:
- **Skeleton Loading**: Layout skeleton yang mirip dengan konten asli
- **Progress Bar**: Bar progress yang menunjukkan kemajuan loading
- **Loading Messages**: Pesan yang berubah-ubah untuk memberikan feedback
- **Animated Elements**: Animasi loading yang menarik
- **Floating Indicator**: Indikator loading yang mengambang di pojok kanan bawah

#### Props:
- `title`: Judul episode (default: 'Episode Player')
- `progress`: Progress loading dari 0-100 (opsional)
- `message`: Pesan loading custom (opsional)

### 2. Enhanced Episode Page (`pages/episode/[id].js`)
Halaman episode yang telah ditingkatkan dengan:
- **Real-time Progress**: Progress loading yang real-time
- **Dynamic Messages**: Pesan yang berubah sesuai status loading
- **Better Error Handling**: Error state yang lebih informatif
- **Auto-fetch**: Auto-fetch data jika tidak tersedia dari server

## Fitur Utama

### 1. Skeleton Loading
- Header skeleton dengan tombol back dan judul
- Video player skeleton dengan aspect ratio yang tepat
- Quality options skeleton dengan grid layout
- Semua skeleton menggunakan animasi `animate-pulse`

### 2. Progress Tracking
- Progress bar yang smooth dengan gradient warna
- Progress yang diupdate secara real-time
- Progress yang berhenti di 90% sampai data benar-benar siap

### 3. Dynamic Messages
- Pesan yang berubah setiap 1.5 detik
- Pesan yang informatif tentang apa yang sedang terjadi
- Support untuk pesan custom dari parent component

### 4. Loading Animations
- Bouncing dots dengan delay yang berbeda
- Spinning ring dengan warna primary
- Floating loading indicator
- Smooth transitions dan hover effects

## Cara Kerja

### 1. Initial Load
```javascript
// Saat halaman pertama kali dibuka
if (!initialData && !loading) {
  setLoading(true);
  setLoadingProgress(0);
  setLoadingMessage('Memuat episode...');
  
  // Auto-fetch data
  const episodeUrl = `https://v1.samehadaku.how/${router.query.id}/`;
  fetchVideoData(episodeUrl);
}
```

### 2. Progress Simulation
```javascript
// Simulasi progress loading
const progressInterval = setInterval(() => {
  setLoadingProgress(prev => {
    if (prev >= 90) return prev;
    return prev + Math.random() * 8;
  });
}, 300);
```

### 3. Message Rotation
```javascript
// Rotasi pesan loading
const messageInterval = setInterval(() => {
  setLoadingMessage(prev => {
    const messages = [
      'Memuat episode...',
      'Mengambil data video...',
      'Menyiapkan player...',
      'Hampir selesai...'
    ];
    const currentIndex = messages.indexOf(prev);
    const nextIndex = (currentIndex + 1) % messages.length;
    return messages[nextIndex];
  });
}, 1500);
```

## Styling

### 1. Color Scheme
- **Primary**: `primary-500`, `primary-400` untuk progress bar
- **Background**: `dark-900`, `dark-800`, `dark-700` untuk skeleton
- **Text**: `dark-300`, `dark-400` untuk text secondary
- **Accent**: `primary-600` untuk floating indicator

### 2. Animations
- `animate-pulse`: Untuk skeleton elements
- `animate-bounce`: Untuk loading dots
- `animate-spin`: Untuk spinning indicators
- `transition-all duration-500`: Untuk smooth transitions

### 3. Responsive Design
- Grid layout yang responsive untuk quality options
- Spacing yang konsisten dengan `p-6`, `mb-6`
- Max width yang responsive dengan `max-w-2xl`

## Keuntungan

### 1. User Experience
- Loading yang tidak membosankan
- Feedback yang jelas tentang apa yang sedang terjadi
- Transisi yang smooth dari loading ke konten

### 2. Performance
- Skeleton loading yang cepat
- Progress yang realistis
- Tidak ada blocking UI

### 3. Accessibility
- Text yang jelas dan informatif
- Contrast yang baik
- Loading state yang jelas

## Penggunaan

### 1. Basic Usage
```javascript
import EpisodeLoading from '../../components/EpisodeLoading';

// Dalam component
if (loading) {
  return <EpisodeLoading title={title} />;
}
```

### 2. With Custom Progress
```javascript
if (loading) {
  return <EpisodeLoading 
    title={title} 
    progress={loadingProgress} 
    message={loadingMessage} 
  />;
}
```

### 3. Auto Progress
```javascript
// Component akan mengatur progress sendiri
if (loading) {
  return <EpisodeLoading title={title} />;
}
```

## Future Improvements

### 1. API Integration
- Integrasi dengan real API progress
- WebSocket untuk real-time updates
- Server-sent events untuk streaming progress

### 2. Customization
- Theme support (light/dark mode)
- Custom animation patterns
- Configurable skeleton layouts

### 3. Performance
- Lazy loading untuk skeleton components
- Optimized animations
- Better memory management

## Testing

### 1. Manual Testing
- Buka halaman episode dengan data kosong
- Test loading state dengan network throttling
- Verify progress bar dan messages

### 2. Automated Testing
- Unit tests untuk component
- Integration tests untuk loading flow
- E2E tests untuk user experience

## Dependencies

- **React**: Hooks (useState, useEffect)
- **Tailwind CSS**: Untuk styling dan animations
- **Next.js**: Untuk routing dan SSR

## Browser Support

- Modern browsers dengan ES6+ support
- CSS animations dan transitions
- Flexbox dan Grid layout support
