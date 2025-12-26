import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClipboardList, CheckCircle, Clock, Calendar, AlertCircle, FileText } from "lucide-react";
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
      <div className="mb-10">
        <h1 className="heading-1">My Tasks</h1>
        <p className="body-text">View and track your assigned tasks</p>
      </div>

      {studentTasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <ClipboardList className="empty-state-icon" />
            <h2 className="empty-state-title">No Tasks Assigned</h2>
            <p className="empty-state-description">
              You don't have any tasks assigned yet. Check back later!
            </p>
          </div>
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
                className="card card-hover overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="heading-4">
                          {studentTask.Task.title}
                        </h3>
                        <span
                          className={`badge ${
                            isAccepted
                              ? "badge-success"
                              : isRejected
                              ? "badge-danger"
                              : isPending
                              ? "badge-info"
                              : isOverdue
                              ? "badge-danger"
                              : "badge-warning"
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
                      <p className="body-text mb-4">{studentTask.Task.description}</p>
                      <div className="flex items-center gap-6 body-text-sm text-gray-500 flex-wrap">
                        {studentTask.Task.dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>
                              Due: {new Date(studentTask.Task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {studentTask.Task.week && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span>Week {studentTask.Task.week}</span>
                          </div>
                        )}
                        {submission && (
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-indigo-500" />
                            <span>
                              Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      {isRejected && submission?.feedback && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-red-800 mb-1">
                                Feedback from Admin:
                              </p>
                              <p className="body-text-sm text-red-700">{submission.feedback}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {isAccepted ? (
                        <CheckCircle className="h-10 w-10 text-green-500" />
                      ) : (
                        <Clock className="h-10 w-10 text-gray-400" />
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

