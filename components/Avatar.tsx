"use client";

import { memo } from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

// Generate consistent color from string
function getColorFromString(str: string): string {
  const colors = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const initials = getInitials(name);
  const bgColor = getColorFromString(name || "user");

  if (src) {
    return (
      <div className={`relative ${sizeClass} rounded-full overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={name || "User"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 40px, 64px"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {initials}
    </div>
  );
}

export default memo(Avatar);
