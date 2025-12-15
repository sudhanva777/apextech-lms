"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { User, Settings, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar";
import Link from "next/link";

export default function AvatarDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const userRole = user ? (user as any).role : null;
  const userImage = user ? (user as any).image : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (!user) return null;

  const dashboardHref = userRole === "ADMIN" ? "/admin" : "/student";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="User menu"
      >
        <Avatar
          src={userImage || undefined}
          name={user.name || undefined}
          size="sm"
        />
        <ChevronDown
          className={`h-4 w-4 text-slate-600 dark:text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg py-2 z-50"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {user.email}
              </p>
            </div>

            <div className="py-1">
              <Link
                href={dashboardHref}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href={userRole === "ADMIN" ? "/admin/profile" : "/student/profile"}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href={userRole === "ADMIN" ? "/admin/settings" : "/student/settings"}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
