// API endpoint untuk memberikan status scraping
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Simulasi status scraping - dalam implementasi nyata, 
    // ini akan mengambil status dari backend atau database
    // Untuk demo, kita akan memberikan progress yang berubah-ubah
    const currentTime = Date.now();
    const startTime = new Date(currentTime - 30000).getTime(); // 30 detik yang lalu
    const elapsed = currentTime - startTime;
    const estimatedTotal = 120000; // 2 menit
    
    let progress = Math.min(Math.floor((elapsed / estimatedTotal) * 100), 95);
    let status = 'scraping';
    
    // Jika progress sudah 95% atau lebih, kemungkinan selesai
    if (progress >= 95) {
      status = 'completed';
      progress = 100;
    }
    
    const scrapingStatus = {
      status: status,
      progress: progress,
      message: 'Mengumpulkan episode anime terbaru...',
      startTime: new Date(startTime).toISOString(),
      estimatedTime: '2-3 menit'
    };

    // Jika ada data anime di database, status bisa 'completed'
    // Jika sedang dalam proses scraping, status 'scraping'
    // Jika error, status 'error'
    
    // Untuk demo, kita akan memberikan status yang lebih realistis
    // Dalam implementasi nyata, ini akan mengecek database atau backend status
    
    // Simulasi: jika progress > 90%, kemungkinan ada data
    if (scrapingStatus.progress > 90) {
      scrapingStatus.status = 'completed';
      scrapingStatus.progress = 100;
      scrapingStatus.message = 'Data anime berhasil dikumpulkan!';
    }

    res.status(200).json({
      success: true,
      data: scrapingStatus
    });
  } catch (error) {
    console.error('Error getting scraping status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan status scraping'
    });
  }
}
