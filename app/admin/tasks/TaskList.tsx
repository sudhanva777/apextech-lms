"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, User, Calendar, Clock, CheckCircle, Plus, Trash2, Loader2, X, Edit, Eye, Check, XCircle } from "lucide-react";
import AssignTaskModal from "./AssignTaskModal";

interface Task {
  id: string;
  title: string;
  description: string;
  week: number | null;
  dueDate: Date | null;
  StudentTask: Array<{
    id: string;
    status: string;
    User: { id: string; name: string | null; email: string | null };
  }>;
}

interface Student {
  id: string;
  name: string | null;
  email: string | null;
}

interface StudentTask {
  id: string;
  status: string;
  Task: { id: string; title: string; week: number | null; dueDate: Date | null };
  User: { id: string; name: string | null; email: string | null };
}

interface TaskListProps {
  tasks: Task[];
  studentTasks: StudentTask[];
  students: Student[];
  assignToUserId?: string;
}

export default function TaskList({ tasks: initialTasks, studentTasks, students, assignToUserId }: TaskListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskForDueDate, setTaskForDueDate] = useState<{ id: string; currentDate: string } | null>(null);
  const [taskForSubmissions, setTaskForSubmissions] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isReviewing, setIsReviewing] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  const [dueDateSuccess, setDueDateSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [weekFilter, setWeekFilter] = useState(searchParams.get("week") || "");
  const [studentFilter, setStudentFilter] = useState(searchParams.get("student") || "");

  // Sync local tasks state with prop changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (weekFilter) params.set("week", weekFilter);
    if (studentFilter) params.set("student", studentFilter);
    router.push(`/admin/tasks?${params.toString()}`);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setWeekFilter("");
    setStudentFilter("");
    router.push("/admin/tasks");
  };

  const handleEditTask = async (taskId: string, formData: { title: string; description: string; week: string; dueDate: string }) => {
    setIsEditing(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          week: formData.week ? parseInt(formData.week) : null,
          dueDate: formData.dueDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update task");
      }

      // Update task in UI immediately
      setTasks(tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: formData.title,
              description: formData.description,
              week: formData.week ? parseInt(formData.week) : null,
              dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
            }
          : task
      ));
      setTaskToEdit(null);
      setEditSuccess(true);

      setTimeout(() => {
        setEditSuccess(false);
      }, 3000);

      router.refresh();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to update task");
      console.error("Edit task error:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleUpdateDueDate = async (taskId: string, newDueDate: string) => {
    setIsUpdatingDueDate(true);
    setDueDateError(null);
    setDueDateSuccess(false);

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/due-date`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: newDueDate }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update due date");
      }

      // Update task in UI immediately
      setTasks(tasks.map((task) =>
        task.id === taskId
          ? { ...task, dueDate: new Date(newDueDate) }
          : task
      ));
      setTaskForDueDate(null);
      setDueDateSuccess(true);

      setTimeout(() => {
        setDueDateSuccess(false);
      }, 3000);

      router.refresh();
    } catch (error) {
      setDueDateError(error instanceof Error ? error.message : "Failed to update due date");
      console.error("Update due date error:", error);
    } finally {
      setIsUpdatingDueDate(false);
    }
  };

  const handleViewSubmissions = async (taskId: string) => {
    setTaskForSubmissions(taskId);
    setIsLoadingSubmissions(true);
    setSubmissions([]);

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/submissions`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch submissions");
      }

      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error("Fetch submissions error:", error);
      setSubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleReviewSubmission = async (submissionId: string, status: "ACCEPTED" | "REJECTED", feedback?: string) => {
    setIsReviewing(submissionId);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to review submission");
      }

      // Update submission in UI immediately
      setSubmissions(submissions.map((sub) =>
        sub.id === submissionId
          ? { ...sub, status, feedback: feedback || null }
          : sub
      ));
      setReviewSuccess(true);

      setTimeout(() => {
        setReviewSuccess(false);
      }, 3000);

      router.refresh();
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Failed to review submission");
      console.error("Review submission error:", error);
    } finally {
      setIsReviewing(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete task");
      }

      // Remove task from UI immediately
      setTasks(tasks.filter((task) => task.id !== taskId));
      setTaskToDelete(null);
      setDeleteSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);

      // Refresh the page to update the list
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete task");
      console.error("Delete task error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-[#4F46E5]" />
          All Tasks & Assignments
        </h2>

        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          <select
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          >
            <option value="">All Weeks</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week.toString()}>
                Week {week}
              </option>
            ))}
          </select>

          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name || student.email}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="btn-primary flex-1 text-sm py-2"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-[#4F46E5] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {task.week && <span>Week {task.week}</span>}
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                      <button
                        onClick={() => {
                          if (task.dueDate) {
                            setTaskForDueDate({ id: task.id, currentDate: new Date(task.dueDate).toISOString().split('T')[0] });
                          }
                        }}
                        className="ml-1 text-indigo-600 hover:text-indigo-700"
                        title="Change due date"
                      >
                        📅
                      </button>
                    </span>
                  )}
                  {!task.dueDate && (
                    <button
                      onClick={() => setTaskForDueDate({ id: task.id, currentDate: "" })}
                      className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center gap-1"
                      title="Set due date"
                    >
                      <Calendar size={12} />
                      Set due date
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewSubmissions(task.id)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                  title="View submissions"
                >
                  <Eye size={16} />
                  Submissions
                </button>
                <button
                  onClick={() => setSelectedTask(task.id)}
                  className="text-[#4F46E5] hover:text-[#4338ca] flex items-center gap-1 text-sm font-medium"
                >
                  <Plus size={16} />
                  Assign
                </button>
                <button
                  onClick={() => setTaskToEdit(task)}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm font-medium"
                  title="Edit task"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setTaskToDelete(task.id)}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Assigned Students */}
            {task.StudentTask.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Assigned to:</p>
                <div className="flex flex-wrap gap-2">
                  {task.StudentTask.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-sm"
                    >
                      <User size={14} />
                      <span className="text-gray-700">{st.User.name || st.User.email}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          st.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {st.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Student Tasks List (Filtered) */}
      {studentTasks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filtered Assignments</h3>
          <div className="space-y-3">
            {studentTasks.map((st) => (
              <div
                key={st.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#4F46E5] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{st.Task.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Student: {st.User.name || st.User.email}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      {st.Task.week && <span>Week {st.Task.week}</span>}
                      {st.Task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Due: {new Date(st.Task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        st.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : st.status === "OVERDUE"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {st.status}
                    </span>
                    {st.status === "COMPLETED" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {deleteSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Task deleted successfully</span>
          <button
            onClick={() => setDeleteSuccess(false)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {deleteError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <X className="h-5 w-5" />
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this task? This action cannot be undone and will also delete all related assignments and submissions.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTask(taskToDelete)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {taskToEdit && (
        <EditTaskModal
          task={taskToEdit}
          onClose={() => setTaskToEdit(null)}
          onSave={handleEditTask}
          isLoading={isEditing}
        />
      )}

      {/* Quick Due Date Change Modal */}
      {taskForDueDate && (
        <DueDateModal
          taskId={taskForDueDate.id}
          currentDate={taskForDueDate.currentDate}
          onClose={() => setTaskForDueDate(null)}
          onSave={handleUpdateDueDate}
          isLoading={isUpdatingDueDate}
        />
      )}

      {/* View Submissions Modal */}
      {taskForSubmissions && (
        <SubmissionsModal
          taskId={taskForSubmissions}
          submissions={submissions}
          isLoading={isLoadingSubmissions}
          isReviewing={isReviewing}
          onClose={() => {
            setTaskForSubmissions(null);
            setSubmissions([]);
          }}
          onReview={handleReviewSubmission}
          onRefresh={() => handleViewSubmissions(taskForSubmissions)}
        />
      )}

      {/* Success/Error Messages for Edit */}
      {editSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Task updated successfully</span>
          <button
            onClick={() => setEditSuccess(false)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {editError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <X className="h-5 w-5" />
          <span>{editError}</span>
          <button
            onClick={() => setEditError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success/Error Messages for Due Date */}
      {dueDateSuccess && (
        <div className="fixed top-20 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Due date updated successfully</span>
          <button
            onClick={() => setDueDateSuccess(false)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {dueDateError && (
        <div className="fixed top-20 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <X className="h-5 w-5" />
          <span>{dueDateError}</span>
          <button
            onClick={() => setDueDateError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success/Error Messages for Review */}
      {reviewSuccess && (
        <div className="fixed top-36 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Submission reviewed successfully</span>
          <button
            onClick={() => setReviewSuccess(false)}
            className="ml-2 text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {reviewError && (
        <div className="fixed top-36 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <X className="h-5 w-5" />
          <span>{reviewError}</span>
          <button
            onClick={() => setReviewError(null)}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {selectedTask && (
        <AssignTaskModal
          taskId={selectedTask}
          students={students}
          onClose={() => setSelectedTask(null)}
          defaultUserId={assignToUserId}
        />
      )}
    </div>
  );
}

// Edit Task Modal Component
function EditTaskModal({
  task,
  onClose,
  onSave,
  isLoading,
}: {
  task: Task;
  onClose: () => void;
  onSave: (taskId: string, formData: { title: string; description: string; week: string; dueDate: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    week: task.week?.toString() || "",
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }
    onSave(task.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Week Number</label>
              <input
                type="number"
                min="1"
                max="16"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Update Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Quick Due Date Change Modal
function DueDateModal({
  taskId,
  currentDate,
  onClose,
  onSave,
  isLoading,
}: {
  taskId: string;
  currentDate: string;
  onClose: () => void;
  onSave: (taskId: string, newDueDate: string) => void;
  isLoading: boolean;
}) {
  const [newDate, setNewDate] = useState(currentDate || "");
  const minDate = new Date().toISOString().split('T')[0]; // Today's date

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      return;
    }
    onSave(taskId, newDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Change Due Date</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Cannot select past dates</p>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !newDate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Update Date
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Submissions Modal Component
function SubmissionsModal({
  taskId,
  submissions,
  isLoading,
  isReviewing,
  onClose,
  onReview,
  onRefresh,
}: {
  taskId: string;
  submissions: any[];
  isLoading: boolean;
  isReviewing: string | null;
  onClose: () => void;
  onReview: (submissionId: string, status: "ACCEPTED" | "REJECTED", feedback?: string) => void;
  onRefresh: () => void;
}) {
  const [rejectingSubmission, setRejectingSubmission] = useState<string | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState("");

  const handleReject = (submissionId: string) => {
    if (!rejectionFeedback.trim()) {
      alert("Feedback is required when rejecting a submission");
      return;
    }
    onReview(submissionId, "REJECTED", rejectionFeedback);
    setRejectingSubmission(null);
    setRejectionFeedback("");
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACCEPTED: "bg-green-100 text-green-800",
      APPROVED: "bg-green-100 text-green-800", // Support both for compatibility
      REJECTED: "bg-red-100 text-red-800",
      PENDING: "bg-yellow-100 text-yellow-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Task Submissions</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="text-indigo-600 hover:text-indigo-700 text-sm"
              disabled={isLoading}
            >
              Refresh
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600">Loading submissions...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No submissions yet for this task.
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {submission.User?.name || submission.User?.email || "Unknown Student"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Submitted: {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {submission.answerText && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{submission.answerText}</p>
                      </div>
                    )}
                    {submission.fileUrl && (
                      <div className="mt-2">
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          View submitted file →
                        </a>
                      </div>
                    )}
                    {submission.feedback && (
                      <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-xs font-medium text-yellow-800 mb-1">Admin Feedback:</p>
                        <p className="text-sm text-yellow-700">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                      {submission.status}
                    </span>
                    {submission.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onReview(submission.id, "ACCEPTED")}
                          disabled={isReviewing === submission.id}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          {isReviewing === submission.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingSubmission(submission.id)}
                          disabled={isReviewing === submission.id}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Feedback Form */}
                {rejectingSubmission === submission.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionFeedback}
                      onChange={(e) => setRejectionFeedback(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="Provide feedback for rejection..."
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReject(submission.id)}
                        disabled={!rejectionFeedback.trim() || isReviewing === submission.id}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium disabled:opacity-50"
                      >
                        Submit Rejection
                      </button>
                      <button
                        onClick={() => {
                          setRejectingSubmission(null);
                          setRejectionFeedback("");
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

