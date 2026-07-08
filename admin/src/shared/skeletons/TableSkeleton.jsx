import React from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full overflow-x-auto" aria-hidden="true">
      <table className="w-full text-sm text-left">
        <thead className="border-b border-border bg-muted/30">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 font-medium text-muted-foreground">
                <Skeleton className="h-4 w-24 rounded-md" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="transition-colors hover:bg-muted/50">
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-4 py-4">
                  <Skeleton className="h-5 w-full max-w-[80%] rounded-md" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
