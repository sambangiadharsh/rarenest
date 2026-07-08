import React from 'react';

export const SkeletonWrapper = ({ loading, skeleton, children }) => {
  if (loading && skeleton) {
    return (
      <div className="w-full h-full" aria-hidden="true">
        {skeleton}
      </div>
    );
  }

  return <>{children}</>;
};

export default SkeletonWrapper;
