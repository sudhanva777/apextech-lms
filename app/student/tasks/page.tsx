import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClipboardList, CheckCircle, Clock, Calendar, AlertCircle } from "lucide-react";
import SubmitTaskForm from "./SubmitTaskForm";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  const sessionUser = session?.user;
  if (!sessionUser) redirect("/auth/login");
  if (sessionUser.role !== "STUDENT") redirect("/admin");

  if (!sessionUser.email) {
    return <div>Error: No user email found</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: sessionUser.email },
    select: { id: true },
  });

  if (!user) {
    return <div>Error: User not found</div>;
  }

  // Parallelize queries
  const [studentTasks, taskSubmissions] = await Promise.all([
    prisma.studentTask.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        taskId: true,
        status: true,
        createdAt: true,
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
      orderBy: { createdAt: "desc" },
    }),
    prisma.taskSubmission.findMany({
      where: {
        studentId: user.id,
      },
      select: {
        id: true,
        taskId: true,
        answerText: true,
        fileUrl: true,
        status: true,
        feedback: true,
        createdAt: true,
      },
    }),
  ]);

  // Get all task IDs
  const taskIds = studentTasks.map((st) => st.taskId);

  // Filter submissions for relevant tasks
  const relevantSubmissions = taskSubmissions.filter((sub) =>
    taskIds.includes(sub.taskId)
  );

  // Create a map for quick lookup
  const submissionMap = new Map(
    relevantSubmissions.map((sub) => [sub.taskId, sub])
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Tasks</h1>
        <p className="text-gray-600">View and track your assigned tasks</p>
      </div>

      {studentTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tasks Assigned</h2>
          <p className="text-gray-600">
            You don't have any tasks assigned yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {studentTasks.map((studentTask) => {
            const submission = submissionMap.get(studentTask.taskId);
            const isAccepted = submission?.status === "ACCEPTED";
            const isRejected = submission?.status === "REJECTED";
            const isPending = submission?.status === "PENDING";
            const isCompleted = isAccepted || studentTask.status === "COMPLETED";
            const isOverdue =
              studentTask.Task.dueDate &&
              new Date(studentTask.Task.dueDate) < new Date() &&
              !isCompleted;

            return (
              <div
                key={studentTask.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {studentTask.Task.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isAccepted
                              ? "bg-green-100 text-green-800"
                              : isRejected
                              ? "bg-red-100 text-red-800"
                              : isPending
                              ? "bg-blue-100 text-blue-800"
                              : isOverdue
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isAccepted
                            ? "ACCEPTED"
                            : isRejected
                            ? "REJECTED"
                            : isPending
                            ? "PENDING REVIEW"
                            : studentTask.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{studentTask.Task.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        {studentTask.Task.dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>
                              Due: {new Date(studentTask.Task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {studentTask.Task.week && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>Week {studentTask.Task.week}</span>
                          </div>
                        )}
                        {submission && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            <span>
                              Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      {isRejected && submission?.feedback && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-red-800">
                                Feedback from Admin:
                              </p>
                              <p className="text-sm text-red-700 mt-1">{submission.feedback}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {isAccepted ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <Clock className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                {(!submission || isRejected) && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <SubmitTaskForm
                      taskId={studentTask.taskId}
                      studentTaskId={studentTask.id}
                      existingSubmission={submission || undefined}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

