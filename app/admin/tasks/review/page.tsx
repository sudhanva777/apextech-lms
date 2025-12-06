import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ClipboardCheck, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import Link from "next/link";

export default async function TaskReviewPage() {
  const session = await requireAdmin();

  const submissions = await prisma.taskSubmission.findMany({
    include: {
      User: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      Task: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="h-5 w-5" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5" />;
      case "PENDING":
        return <Clock className="h-5 w-5" />;
      default:
        return <ClipboardCheck className="h-5 w-5" />;
    }
  };

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const acceptedCount = submissions.filter((s) => s.status === "ACCEPTED").length;
  const rejectedCount = submissions.filter((s) => s.status === "REJECTED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Task Review Panel</h1>
        <p className="text-gray-600">Review and manage student task submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
            </div>
            <ClipboardCheck className="h-12 w-12 text-[#4F46E5]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Accepted</p>
              <p className="text-3xl font-bold text-gray-900">{acceptedCount}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Rejected</p>
              <p className="text-3xl font-bold text-gray-900">{rejectedCount}</p>
            </div>
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-[#4F46E5]" />
            All Task Submissions ({submissions.length})
          </h2>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No task submissions yet</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <Link
                key={submission.id}
                href={`/admin/tasks/review/${submission.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.Task.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          submission.status
                        )}`}
                      >
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {submission.Task.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>
                        Student: {submission.User.name || submission.User.email || "N/A"}
                      </span>
                      <span>
                        Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                      {submission.answerText && (
                        <span className="text-[#4F46E5]">Has text answer</span>
                      )}
                      {submission.fileUrl && (
                        <span className="text-[#4F46E5]">Has file attachment</span>
                      )}
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-gray-400 ml-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

