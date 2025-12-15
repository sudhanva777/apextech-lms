import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GraduationCap, BookOpen, CheckCircle, Clock, TrendingUp, FileText, Target } from "lucide-react";
import Link from "next/link";
import StudentDashboardClient from "./DashboardClient";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  const sessionUser = session?.user;
  if (!sessionUser) redirect("/auth/login");
  if (sessionUser.role !== "STUDENT") redirect("/admin");

  if (!sessionUser.email) {
    return <div>Error: No user email found</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email },
    select: {
      id: true,
      name: true,
      image: true,
      StudentProfile: {
        select: {
          programTrack: true,
        },
      },
      StudentTask: {
        select: {
          id: true,
        },
      },
      ProjectSubmission: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          status: true,
        },
      },
      TaskSubmission: {
        select: {
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  // Count completed tasks (ACCEPTED submissions)
  const acceptedSubmissions = user?.TaskSubmission.filter(
    (s) => s.status === "ACCEPTED"
  ).length || 0;
  const completedTasks = acceptedSubmissions;
  const totalTasks = user?.StudentTask.length || 0;
  const pendingTasks = totalTasks - acceptedSubmissions;
  const rejectedTasks = user?.TaskSubmission.filter((s) => s.status === "REJECTED").length || 0;
  const projectStatus = user?.ProjectSubmission[0]?.status || "NOT_SUBMITTED";
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Here's your learning progress</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Tasks Assigned */}
        <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Tasks Assigned</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalTasks}</p>
        </div>

        {/* Tasks Completed */}
        <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Tasks Completed</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedTasks}</p>
          {rejectedTasks > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              {rejectedTasks} need resubmission
            </p>
          )}
        </div>

        {/* Overall Progress */}
        <div className="group bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-200/50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
              {progressPercentage}%
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Overall Progress</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {completedTasks}/{totalTasks}
          </p>
          <div className="mt-3 h-2 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Project Status */}
        <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Project Status</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
            {projectStatus.replace("_", " ")}
          </p>
        </div>

        {/* Program Track */}
        <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Program Track</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {user?.StudentProfile?.programTrack || "Not enrolled"}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h2>
              <Target className="h-5 w-5 text-slate-400" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Link
                href="/student/tasks"
                className="group p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/30 transition-colors">
                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">View Tasks</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Check assignments and progress
                </p>
              </Link>
              <Link
                href="/student/project"
                className="group p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
                    <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Submit Project</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload your major project
                </p>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
              <Clock className="h-5 w-5 text-slate-400" />
            </div>
            <StudentDashboardClient recentSubmissions={user?.TaskSubmission || []} />
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Task Summary</h3>
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
              {rejectedTasks > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Rejected</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{rejectedTasks}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
