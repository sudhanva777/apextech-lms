import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ClipboardCheck, FileText, User, Calendar, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import TaskReviewForm from "./TaskReviewForm";

export default async function TaskReviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAdmin();

  const submission = await prisma.taskSubmission.findUnique({
    where: { id: params.id },
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
          dueDate: true,
          week: true,
        },
      },
    },
  });

  if (!submission) {
    notFound();
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin/tasks/review"
          className="text-[#4F46E5] hover:underline mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Task Reviews
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Task Review</h1>
        <p className="text-gray-600">Review and provide feedback on student task submission</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Submission Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="h-6 w-6 text-[#4F46E5]" />
                {submission.Task.title}
              </h2>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  submission.status
                )}`}
              >
                {submission.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Information
                </label>
                <div className="flex items-center gap-2 text-gray-900">
                  <User size={18} />
                  <span className="font-semibold">
                    {submission.User.name || submission.User.email || "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description
                </label>
                <p className="text-gray-700 whitespace-pre-wrap">{submission.Task.description}</p>
              </div>

              {submission.answerText && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Answer
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.answerText}</p>
                  </div>
                </div>
              )}

              {submission.fileUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attached File
                  </label>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#4F46E5] hover:underline"
                  >
                    <Download size={20} />
                    <span>Download File</span>
                  </a>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submitted At
                  </label>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} />
                    <span>{new Date(submission.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {submission.updatedAt && submission.updatedAt !== submission.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>{new Date(submission.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {submission.feedback && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Feedback
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky top-8">
            <TaskReviewForm
              submissionId={submission.id}
              currentStatus={submission.status}
              studentTaskId={submission.studentId}
              taskId={submission.taskId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

