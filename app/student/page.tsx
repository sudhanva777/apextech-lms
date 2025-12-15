import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GraduationCap, BookOpen, CheckCircle, Clock } from "lucide-react";

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
        },
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Here's your learning progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Tasks Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {completedTasks}/{totalTasks}
              </p>
              {rejectedTasks > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {rejectedTasks} rejected - Please resubmit
                </p>
              )}
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Project Status</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                {projectStatus.replace("_", " ")}
              </p>
            </div>
            <GraduationCap className="h-12 w-12 text-[#4F46E5]" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Program Track</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {user?.StudentProfile?.programTrack || "Not enrolled"}
              </p>
            </div>
            <BookOpen className="h-12 w-12 text-[#6366F1]" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/student/tasks"
            className="p-4 border-2 border-gray-200 dark:border-slate-700 rounded-lg hover:border-[#4F46E5] dark:hover:border-indigo-500 hover:bg-[#EEF2FF] dark:hover:bg-indigo-950/30 transition-all"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">View Tasks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Check your assignments and progress</p>
          </a>
          <a
            href="/student/project"
            className="p-4 border-2 border-gray-200 dark:border-slate-700 rounded-lg hover:border-[#4F46E5] dark:hover:border-indigo-500 hover:bg-[#EEF2FF] dark:hover:bg-indigo-950/30 transition-all"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Submit Project</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload your major project</p>
          </a>
        </div>
      </div>
    </div>
  );
}

