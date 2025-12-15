"use client";

import { Search, Bell } from "lucide-react";
import AvatarDropdown from "./AvatarDropdown";

interface AdminTopNavProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export default function AdminTopNav({ user }: AdminTopNavProps) {
  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students, tasks, projects..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            {/* Avatar Dropdown */}
            <AvatarDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}

