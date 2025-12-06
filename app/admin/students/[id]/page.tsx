import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { User, Mail, Phone, Calendar, BookOpen, ClipboardList, FolderKanban, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      StudentProfile: true,
      StudentTask: {
        include: { Task: true },
        orderBy: { createdAt: "desc" },
      },
      ProjectSubmission: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const completedTasks = user.StudentTask.filter((t) => t.status === "COMPLETED").length;
  const totalTasks = user.StudentTask.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin/students"
          className="text-[#4F46E5] hover:underline mb-4 inline-block"
        >
          ← Back to Students
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Student Profile: {user.name || "N/A"}
        </h1>
        <p className="text-gray-600">View student details, tasks, and project submissions</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <User className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 font-semibold">{user.name || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <Mail className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 font-semibold">{user.email || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <Phone className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900 font-semibold">{user.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <BookOpen className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Track
                </label>
                <p className="text-gray-900 font-semibold">
                  {user.StudentProfile?.programTrack || "Not enrolled"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#EEF2FF] rounded-lg">
                <Calendar className="h-6 w-6 text-[#4F46E5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                <p className="text-gray-900 font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Task Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Tasks</span>
              <span className="text-2xl font-bold text-gray-900">{totalTasks}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-gray-600">Completed</span>
              <span className="text-2xl font-bold text-green-600">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <span className="text-gray-600">Pending</span>
              <span className="text-2xl font-bold text-yellow-600">
                {totalTasks - completedTasks}
              </span>
            </div>
          </div>
          <Link
            href={`/admin/tasks?assignTo=${user.id}`}
            className="mt-6 btn-primary w-full text-center inline-block"
          >
            Assign New Task
          </Link>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-[#4F46E5]" />
          Assigned Tasks
        </h2>
        {user.StudentTask.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks assigned yet</p>
        ) : (
          <div className="space-y-4">
            {user.StudentTask.map((studentTask) => (
              <div
                key={studentTask.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#4F46E5] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {studentTask.Task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{studentTask.Task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {studentTask.Task.dueDate && (
                        <span>
                          Due: {new Date(studentTask.Task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {studentTask.Task.week && <span>Week {studentTask.Task.week}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        studentTask.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {studentTask.status}
                    </span>
                    {studentTask.status === "COMPLETED" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Submissions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FolderKanban className="h-6 w-6 text-[#4F46E5]" />
          Project Submissions
        </h2>
        {user.ProjectSubmission.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No project submissions yet</p>
        ) : (
          <div className="space-y-4">
            {user.ProjectSubmission.map((submission) => (
              <Link
                key={submission.id}
                href={`/admin/projects/${submission.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-[#4F46E5] hover:bg-[#EEF2FF] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{submission.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {submission.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      submission.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : submission.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {submission.status.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

