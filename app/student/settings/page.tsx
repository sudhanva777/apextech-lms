import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, Bell, Shield, User, BookOpen } from "lucide-react";
import Link from "next/link";

export default async function StudentSettingsPage() {
  const session = await getServerSession(authOptions);

  const sessionUser = session?.user;
  if (!sessionUser) redirect("/auth/login");
  if (sessionUser.role !== "STUDENT") redirect("/unauthorized");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account settings and preferences</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Profile Management</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Update your profile information and personal details
              </p>
              <Link
                href="/student/profile"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
              >
                Go to Profile →
              </Link>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Program Information</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View your program track and enrollment details
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Bell className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Email Notifications</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Receive updates about your tasks, projects, and progress
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">In-App Notifications</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get notified about important announcements and updates
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Account Security</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your account is secured with authentication
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Password</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your password and account access
              </p>
            </div>
          </div>
        </div>

        {/* Learning Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Learning Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Progress Tracking</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View your learning progress and completion status
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Task Preferences</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your task submission preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

