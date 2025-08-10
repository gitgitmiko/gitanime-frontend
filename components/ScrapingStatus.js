import { FiDatabase, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ScrapingStatus({ status, progress, message, estimatedTime }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'scraping':
        return <FiDatabase className="w-6 h-6 text-primary-500 animate-pulse" />;
      case 'completed':
        return <FiCheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <FiAlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <FiClock className="w-6 h-6 text-dark-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'scraping':
        return 'Sedang Mengumpulkan Data Anime...';
      case 'completed':
        return 'Data Anime Berhasil Dimuat!';
      case 'error':
        return 'Terjadi Kesalahan Saat Memuat Data';
      default:
        return 'Memuat Data...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'scraping':
        return 'border-primary-500 bg-primary-500/10';
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'error':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-dark-600 bg-dark-700/50';
    }
  };

  return (
    <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
      <div className="flex items-center justify-center space-x-3 mb-6">
        {getStatusIcon()}
        <h2 className="text-xl font-semibold text-white">
          {getStatusText()}
        </h2>
      </div>
      
      {status === 'scraping' && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-300">Progress</span>
              <span className="text-sm font-medium text-primary-400">{progress}%</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${getStatusColor().split(' ')[1]}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Status Message */}
          {message && (
            <div className="text-center">
              <p className="text-dark-300 mb-2">{message}</p>
              {estimatedTime && (
                <p className="text-sm text-dark-400">
                  Estimasi waktu: {estimatedTime}
                </p>
              )}
            </div>
          )}
          
          {/* Tips */}
          <div className="bg-dark-700/50 rounded-lg p-4 border border-dark-600">
            <h4 className="text-sm font-medium text-white mb-2">💡 Tips</h4>
            <ul className="text-xs text-dark-300 space-y-1">
              <li>• Proses ini mungkin memakan waktu beberapa menit untuk pertama kali</li>
              <li>• Pastikan koneksi internet Anda stabil</li>
              <li>• Jangan tutup halaman ini selama proses berlangsung</li>
            </ul>
          </div>
        </div>
      )}
      
      {status === 'completed' && (
        <div className="text-center space-y-4">
          <div className="text-green-400 text-6xl">🎉</div>
          <p className="text-dark-300">
            Data anime berhasil dimuat dan siap ditampilkan!
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-center space-y-4">
          <div className="text-red-400 text-6xl">⚠️</div>
          <p className="text-dark-300">
            Terjadi kesalahan saat memuat data. Silakan coba lagi.
          </p>
        </div>
      )}
    </div>
  );
}
