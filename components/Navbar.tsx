"use client";

import { useState, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import AvatarDropdown from "./AvatarDropdown";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Program", href: "/program" },
  { name: "Internship", href: "/internship" },
  { name: "Major Project", href: "/project" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
] as const;

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  const handleMobileLogout = useCallback(() => {
    setMobileMenuOpen(false);
    handleLogout();
  }, [handleLogout]);

  const userRole = useMemo(() => {
    return session?.user ? (session.user as any).role : null;
  }, [session?.user]);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Logo variant="symbol" />
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#4F46E5] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Actions - Right */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
              {status === "loading" ? (
              <div className="h-9 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ) : !session ? (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#4F46E5] rounded-lg hover:bg-[#4338ca] transition-colors shadow-sm"
                >
                  Apply Now
                </Link>
              </>
            ) : (
              <AvatarDropdown />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-slate-200 dark:border-slate-800"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "text-[#4F46E5] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  {status === "loading" ? (
                    <div className="px-4 py-2 text-sm text-slate-400">Loading...</div>
                  ) : !session ? (
                    <>
                      <Link
                        href="/auth/login"
                        className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/contact"
                        className="block px-4 py-2 text-sm font-semibold text-white bg-[#4F46E5] rounded-lg hover:bg-[#4338ca] text-center transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Apply Now
                      </Link>
                    </>
                  ) : userRole === "ADMIN" ? (
                    <>
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm font-semibold text-white bg-[#4F46E5] rounded-lg hover:bg-[#4338ca] text-center transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                      <button
                        onClick={handleMobileLogout}
                        className="w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/student"
                        className="block px-4 py-2 text-sm font-semibold text-white bg-[#4F46E5] rounded-lg hover:bg-[#4338ca] text-center transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleMobileLogout}
                        className="w-full px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
