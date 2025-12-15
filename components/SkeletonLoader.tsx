"use client";

import { memo } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className = "", variant = "rectangular" }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-700";
  
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <Skeleton variant="rectangular" className="h-6 w-3/4 mb-4" />
      <Skeleton variant="text" className="h-4 w-full mb-2" />
      <Skeleton variant="text" className="h-4 w-5/6" />
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <Skeleton variant="rectangular" className="h-10 w-10 rounded-lg mb-3" />
      <Skeleton variant="text" className="h-4 w-24 mb-2" />
      <Skeleton variant="rectangular" className="h-8 w-16 mb-3" />
      <Skeleton variant="rectangular" className="h-2 w-full rounded-full" />
    </div>
  );
}

export default memo(Skeleton);
