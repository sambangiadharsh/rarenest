import React from 'react';
import BaseSkeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { cn } from "@/shared/lib/utils";

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("relative overflow-hidden rounded-md", className)}
    >
      <BaseSkeleton 
        className="!w-full !h-full !block !rounded-[inherit] absolute inset-0"
        containerClassName="!w-full !h-full !flex !leading-none"
        {...props} 
      />
    </div>
  );
}

export { Skeleton };
