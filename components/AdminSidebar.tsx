"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FolderKanban,
  MessageSquare,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/students", icon: Users, label: "Students" },
  { href: "/admin/tasks", icon: ClipboardCheck, label: "Tasks" },
  { href: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { href: "/admin/chat", icon: MessageSquare, label: "Chat" },
  { href: "/admin/attendance", icon: Calendar, label: "Attendance" },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? "0" : "16rem",
        }}
        className="fixed lg:sticky top-0 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <Logo variant="symbol" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Admin
              </span>
            </Link>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 lg:hidden z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}

