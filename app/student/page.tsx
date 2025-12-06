import { requireStudent } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { GraduationCap, BookOpen, CheckCircle, Clock } from "lucide-react";

export default async function StudentDashboard() {
  const session = await requireStudent();

  if (!session.user?.email) {
    return <div>Error: No user email found</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      StudentProfile: true,
      StudentTask: {
        include: { Task: true },
      },
      ProjectSubmission: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      TaskSubmission: true,
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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's your learning progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Tasks Completed</p>
              <p className="text-3xl font-bold text-gray-900">
                {completedTasks}/{totalTasks}
              </p>
              {rejectedTasks > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {rejectedTasks} rejected - Please resubmit
                </p>
              )}
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Project Status</p>
              <p className="text-lg font-bold text-gray-900 capitalize">
                {projectStatus.replace("_", " ")}
              </p>
            </div>
            <GraduationCap className="h-12 w-12 text-[#4F46E5]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Program Track</p>
              <p className="text-lg font-bold text-gray-900">
                {user?.StudentProfile?.programTrack || "Not enrolled"}
              </p>
            </div>
            <BookOpen className="h-12 w-12 text-[#6366F1]" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/student/tasks"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#4F46E5] hover:bg-[#EEF2FF] transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-1">View Tasks</h3>
            <p className="text-sm text-gray-600">Check your assignments and progress</p>
          </a>
          <a
            href="/student/project"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#4F46E5] hover:bg-[#EEF2FF] transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Submit Project</h3>
            <p className="text-sm text-gray-600">Upload your major project</p>
          </a>
        </div>
      </div>
    </div>
  );
}

