import { FiGrid, FiList } from 'react-icons/fi';

export default function AnimeListSkeleton({ viewMode = 'grid', count = 12 }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {skeletons.map((i) => (
          <div key={i} className="bg-dark-800 rounded-lg p-4 border border-dark-700 animate-pulse">
            <div className="flex space-x-4">
              {/* Image skeleton */}
              <div className="w-24 h-32 bg-dark-700 rounded-lg flex-shrink-0"></div>
              
              {/* Content skeleton */}
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-dark-700 rounded w-3/4"></div>
                <div className="h-4 bg-dark-700 rounded w-1/2"></div>
                <div className="h-4 bg-dark-700 rounded w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-dark-700 rounded w-16"></div>
                  <div className="h-6 bg-dark-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {skeletons.map((i) => (
        <div key={i} className="bg-dark-800 rounded-lg overflow-hidden border border-dark-700 animate-pulse">
          {/* Image skeleton */}
          <div className="w-full h-48 bg-dark-700"></div>
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-5 bg-dark-700 rounded w-3/4"></div>
            <div className="h-4 bg-dark-700 rounded w-1/2"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-dark-700 rounded w-16"></div>
              <div className="h-6 bg-dark-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
