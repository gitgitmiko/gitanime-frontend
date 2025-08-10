import { useState, useEffect } from 'react';

export default function EpisodeLoading({ title = 'Episode Player', progress: externalProgress, message: externalMessage }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Memuat episode...');

  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress);
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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        {/* Header Skeleton */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-24 h-10 bg-dark-700 rounded-lg animate-pulse"></div>
            <div className="h-8 bg-dark-700 rounded-lg animate-pulse flex-1"></div>
          </div>
        </div>

        {/* Video Player Skeleton */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 mb-6">
          <div className="aspect-video bg-dark-700 rounded-lg animate-pulse mb-4"></div>
          
          {/* Progress Bar */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-dark-300 text-sm">{loadingText}</span>
              <span className="text-primary-400 text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Quality Options Skeleton */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="h-6 bg-dark-700 rounded-lg animate-pulse mb-4 w-48"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Floating Loading Indicator */}
        <div className="fixed bottom-6 right-6 bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
