import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, Bell, Shield, Database, Mail } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  const sessionUser = session?.user;
  if (!sessionUser) redirect("/auth/login");
  if (sessionUser.role !== "ADMIN") redirect("/student");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Admin Settings</h1>
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
                Update your profile information and avatar
              </p>
              <a
                href="/admin/profile"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
              >
                Go to Profile →
              </a>
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
                Receive email updates about student submissions and activities
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
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Information</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Platform Version</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Apex Tech Innovation Admin Portal v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

