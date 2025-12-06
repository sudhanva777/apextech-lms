import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Users, ClipboardCheck, FolderKanban, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await requireAdmin();

  // Fetch all statistics
  const [
    totalStudents,
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
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
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
      take: 5,
      include: { StudentProfile: true },
    }),
    prisma.projectSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { User: true },
    }),
    prisma.studentTask.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { Task: true, User: true },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-gray-600">Manage students, tasks, projects, and payments</p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <Users className="h-12 w-12 text-[#4F46E5]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
            </div>
            <ClipboardCheck className="h-12 w-12 text-[#6366F1]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Completed Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{pendingTasks}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Project Submissions Summary */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{totalProjectSubmissions}</p>
            </div>
            <FolderKanban className="h-12 w-12 text-[#4F46E5]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900">{pendingProjectSubmissions}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Accepted</p>
              <p className="text-3xl font-bold text-gray-900">{acceptedProjectSubmissions}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Rejected</p>
              <p className="text-3xl font-bold text-gray-900">{rejectedProjectSubmissions}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Task Submission Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Task Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{totalTaskSubmissions}</p>
            </div>
            <ClipboardCheck className="h-12 w-12 text-[#4F46E5]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending Task Review</p>
              <p className="text-3xl font-bold text-gray-900">{pendingTaskSubmissions}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Accepted Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{acceptedTaskSubmissions}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Rejected Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{rejectedTaskSubmissions}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Latest Students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Latest Students</h2>
          </div>
          <div className="p-6">
            {recentStudents.length === 0 ? (
              <p className="text-gray-500 text-sm">No students yet</p>
            ) : (
              <div className="space-y-4">
                {recentStudents.map((student: { id: string; name: string | null; email: string | null; createdAt: Date; StudentProfile: { programTrack: string | null } | null }) => (
                  <Link
                    key={student.id}
                    href={`/admin/students/${student.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-semibold text-gray-900">{student.name || "N/A"}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/admin/students"
              className="mt-4 block text-center text-[#4F46E5] hover:underline text-sm font-medium"
            >
              View All Students →
            </Link>
          </div>
        </div>

        {/* Latest Submissions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Latest Submissions</h2>
          </div>
          <div className="p-6">
            {recentSubmissions.length === 0 ? (
              <p className="text-gray-500 text-sm">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map((submission: { id: string; title: string; status: string; User: { name: string | null } }) => (
                  <Link
                    key={submission.id}
                    href={`/admin/projects/${submission.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-semibold text-gray-900 truncate">{submission.title}</p>
                    <p className="text-sm text-gray-600">{submission.User.name || "N/A"}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                        submission.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : submission.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {submission.status.replace("_", " ")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/admin/projects"
              className="mt-4 block text-center text-[#4F46E5] hover:underline text-sm font-medium"
            >
              View All Projects →
            </Link>
          </div>
        </div>

        {/* Latest Tasks Assigned */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Task Assignments</h2>
          </div>
          <div className="p-6">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks assigned yet</p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((studentTask: { id: string; status: string; Task: { title: string }; User: { name: string | null } }) => (
                  <div key={studentTask.id} className="p-3 rounded-lg hover:bg-gray-50">
                    <p className="font-semibold text-gray-900 truncate">
                      {studentTask.Task.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {studentTask.User.name || "N/A"}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                        studentTask.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {studentTask.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/admin/tasks"
              className="mt-4 block text-center text-[#4F46E5] hover:underline text-sm font-medium"
            >
              Manage Tasks →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
