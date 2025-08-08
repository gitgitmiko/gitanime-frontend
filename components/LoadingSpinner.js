export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-dark-700 rounded-full animate-pulse`}></div>
        
        {/* Inner spinning ring */}
        <div className={`${sizeClasses[size]} border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
        
        {/* Center dot */}
        <div className={`${sizeClasses[size]} bg-primary-500 rounded-full animate-ping absolute top-0 left-0 opacity-75`}></div>
      </div>
      
      {text && (
        <p className="text-dark-300 mt-4 text-center">
          <span className="loading-dots">{text}</span>
        </p>
      )}
    </div>
  );
}
