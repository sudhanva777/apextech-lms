import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, FolderKanban, User, LogOut, GraduationCap } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "STUDENT") redirect("/admin");

  const navItems = [
    { href: "/student", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/student/tasks", icon: ClipboardList, label: "Tasks" },
    { href: "/student/project", icon: FolderKanban, label: "Project" },
    { href: "/student/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="bg-[#F8FAFC] dark:bg-slate-900 min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 min-h-screen sticky top-0">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-extrabold gradient-text">Student Portal</h2>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-[#EEF2FF] dark:hover:bg-indigo-950/30 hover:text-[#4F46E5] dark:hover:text-indigo-400 transition-all"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <LogoutButton />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

