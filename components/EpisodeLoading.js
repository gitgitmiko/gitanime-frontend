import { useState, useEffect } from 'react';

export default function EpisodeLoading({ title = 'Episode Player', progress: externalProgress, message: externalMessage }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Memuat episode...');
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress);
      
      // Tampilkan completion message jika progress 100%
      if (externalProgress >= 100) {
        setShowCompletion(true);
        setTimeout(() => setShowCompletion(false), 1000);
      }
    } else {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [externalProgress]);

  useEffect(() => {
    if (externalMessage) {
      setLoadingText(externalMessage);
    } else {
      const textInterval = setInterval(() => {
        setLoadingText(prev => {
          const texts = [
            'Memuat episode...',
            'Mengambil data video...',
            'Menyiapkan player...',
            'Hampir selesai...'
          ];
          const currentIndex = texts.indexOf(prev);
          const nextIndex = (currentIndex + 1) % texts.length;
          return texts[nextIndex];
        });
      }, 2000);
      return () => clearInterval(textInterval);
    }
  }, [externalMessage]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header Skeleton */}
        <div className="mb-8 text-center">
          <div className="h-8 bg-dark-700 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-6 bg-dark-700 rounded-lg w-3/4 mx-auto animate-pulse"></div>
        </div>

        {/* Video Player Skeleton */}
        <div className="mb-8">
          <div className="aspect-video bg-dark-800 rounded-lg mb-4 animate-pulse relative overflow-hidden">
            {/* Animated loading overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-primary-400 text-sm font-medium">Memuat Player...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-medium">Progress Loading</span>
            <span className="text-primary-400 text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center mb-8">
          <div className="text-white text-lg font-medium mb-2">
            {showCompletion ? 'Episode Berhasil Dimuat!' : loadingText}
          </div>
          {!showCompletion && (
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>

        {/* Quality Options Skeleton */}
        <div className="bg-dark-800 rounded-lg p-6">
          <div className="h-6 bg-dark-700 rounded-lg mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-12 bg-dark-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Floating Loading Indicator */}
        <div className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg animate-pulse">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
