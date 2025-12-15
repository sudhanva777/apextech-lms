import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, ClipboardCheck, FolderKanban, CheckCircle, Clock, AlertCircle, TrendingUp, UserCheck } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { AdminDashboardClient, StudentsList } from "./DashboardClient";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/student");

  // Fetch all statistics
  const [
    totalStudents,
    activeInterns,
    totalTasks,
    completedTasks,
    pendingTasks,
    totalProjectSubmissions,
    pendingProjectSubmissions,
    acceptedProjectSubmissions,
    rejectedProjectSubmissions,
    totalTaskSubmissions,
    pendingTaskSubmissions,
    acceptedTaskSubmissions,
    rejectedTaskSubmissions,
    recentStudents,
    recentSubmissions,
    recentTasks,
    submissionsToday,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({
      where: {
        role: "STUDENT",
        StudentProfile: {
          status: "ACTIVE",
        },
      },
    }),
    prisma.task.count(),
    prisma.studentTask.count({ where: { status: "COMPLETED" } }),
    prisma.studentTask.count({ where: { status: "PENDING" } }),
    prisma.projectSubmission.count(),
    prisma.projectSubmission.count({ where: { status: "SUBMITTED" } }),
    prisma.projectSubmission.count({ where: { status: "APPROVED" } }),
    prisma.projectSubmission.count({ where: { status: "REJECTED" } }),
    prisma.taskSubmission.count(),
    prisma.taskSubmission.count({ where: { status: "PENDING" } }),
    prisma.taskSubmission.count({ where: { status: "ACCEPTED" } }),
    prisma.taskSubmission.count({ where: { status: "REJECTED" } }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        StudentProfile: {
          select: {
            programTrack: true,
            status: true,
          },
        },
      },
    }),
    prisma.projectSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        User: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.studentTask.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        Task: {
          select: {
            title: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.taskSubmission.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const pendingReviews = pendingProjectSubmissions + pendingTaskSubmissions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Overview of students, tasks, and submissions</p>
      </div>

      {/* KPI Row - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminKPICard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          trend={null}
          gradient="from-indigo-500/10 to-indigo-600/5"
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
        />
        <AdminKPICard
          icon={UserCheck}
          label="Active Interns"
          value={activeInterns}
          trend={null}
          gradient="from-green-500/10 to-green-600/5"
          iconColor="text-green-600 dark:text-green-400"
          iconBg="bg-green-100 dark:bg-green-900/30"
        />
        <AdminKPICard
          icon={Clock}
          label="Pending Reviews"
          value={pendingReviews}
          trend={null}
          gradient="from-yellow-500/10 to-yellow-600/5"
          iconColor="text-yellow-600 dark:text-yellow-400"
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
        />
        <AdminKPICard
          icon={TrendingUp}
          label="Submissions Today"
          value={submissionsToday}
          trend={null}
          gradient="from-blue-500/10 to-blue-600/5"
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
        />
      </div>

      {/* Main Grid - 2 Columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Student List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Students List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Students</h2>
              <Link
                href="/admin/students"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentStudents.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No students yet
                </div>
              ) : (
                recentStudents.map((student) => (
                  <Link
                    key={student.id}
                    href={`/admin/students/${student.id}`}
                    className="group block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={student.image}
                        name={student.name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {student.name || "N/A"}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {student.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.StudentProfile?.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {student.StudentProfile?.status || "INACTIVE"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Submissions</h2>
              <Link
                href="/admin/projects"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentSubmissions.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No submissions yet
                </div>
              ) : (
                recentSubmissions.map((submission) => (
                  <Link
                    key={submission.id}
                    href={`/admin/projects/${submission.id}`}
                    className="group block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={submission.User.image}
                        name={submission.User.name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {submission.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {submission.User.name || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            submission.status === "APPROVED"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                              : submission.status === "REJECTED"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          }`}
                        >
                          {submission.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</span>
                <span className="font-bold text-slate-900 dark:text-white">{totalTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                <span className="font-bold text-green-600 dark:text-green-400">{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400">{pendingTasks}</span>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Project Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total</span>
                <span className="font-bold text-slate-900 dark:text-white">{totalProjectSubmissions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{pendingProjectSubmissions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Approved</span>
                <span className="font-bold text-green-600 dark:text-green-400">{acceptedProjectSubmissions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Rejected</span>
                <span className="font-bold text-red-600 dark:text-red-400">{rejectedProjectSubmissions}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/tasks"
                className="block w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
              >
                Manage Tasks
              </Link>
              <Link
                href="/admin/tasks/review"
                className="block w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
              >
                Review Submissions
              </Link>
              <Link
                href="/admin/students"
                className="block w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
              >
                View All Students
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function AdminKPICard({
  icon: Icon,
  label,
  value,
  trend,
  gradient,
  iconColor,
  iconBg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  trend: number | null;
  gradient: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className={`group bg-gradient-to-br ${gradient} rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 ${iconBg} rounded-lg`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</p>
      <AdminDashboardClient initialValue={value} />
    </div>
  );
}
