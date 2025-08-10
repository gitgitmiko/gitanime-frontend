import { FiLoader } from 'react-icons/fi';

export default function NavigationLoading({ message = 'Memuat halaman...' }) {
  return (
    <div className="fixed inset-0 bg-dark-900/95 z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Loading Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Loading Message */}
        <div className="text-white text-xl font-medium mb-3">{message}</div>
        
        {/* Subtitle */}
        <div className="text-dark-300 text-sm">Mohon tunggu sebentar...</div>
        
        {/* Animated Dots */}
        <div className="flex items-center justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-64 bg-dark-700 rounded-full h-2 mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
