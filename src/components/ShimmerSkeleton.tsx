import React from 'react';

export function ShimmerSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-cream-200/70 rounded-lg ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-cream-200 p-2.5 flex flex-col justify-between">
      <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2">
        <ShimmerSkeleton className="w-full h-full" />
      </div>
      <div className="space-y-2">
        <ShimmerSkeleton className="h-4 w-3/4" />
        <ShimmerSkeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <ShimmerSkeleton className="h-5 w-20" />
          <ShimmerSkeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
