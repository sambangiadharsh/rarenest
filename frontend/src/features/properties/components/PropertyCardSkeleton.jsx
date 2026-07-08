import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function PropertyCardSkeleton({ layout = 'grid', className = '' }) {
  const isList = layout === 'list'

  return (
    <div
      className={`flex overflow-hidden rounded-[24px] border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm ${className} ${
        isList ? 'flex-col sm:h-52 sm:flex-row' : 'flex-col'
      }`}
    >
      {/* Image Section */}
      <div
        className={`relative shrink-0 overflow-hidden bg-neutral-50 dark:bg-neutral-800 ${
          isList ? 'h-52 w-full sm:h-full sm:w-64' : 'h-56 w-full'
        }`}
      >
        <Skeleton height="100%" borderRadius={0} />
      </div>

      {/* Info Section */}
      <div className="flex flex-grow flex-col justify-between p-5">
        <div className="flex flex-col gap-2">
          <Skeleton width="30%" height={12} />
          <Skeleton width="80%" height={24} />
          <Skeleton width="50%" height={16} />
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <hr className="border-t border-neutral-100 dark:border-neutral-800" />
          
          <div className="flex items-center justify-between">
            <Skeleton width={100} height={24} />
            <Skeleton width={60} height={16} />
          </div>

          <hr className="border-t border-neutral-100 dark:border-neutral-800" />
          
          <div className="flex items-center justify-between">
            <Skeleton width={80} height={16} />
            <Skeleton width={100} height={20} />
          </div>
        </div>
      </div>
    </div>
  )
}



