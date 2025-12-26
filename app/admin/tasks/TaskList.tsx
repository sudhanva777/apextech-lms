"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, User, Calendar, Clock, CheckCircle, Plus, Trash2, Loader2, X, Edit, Eye, Check, XCircle, MoreVertical } from "lucide-react";
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
    <div className="card">
      <div className="mb-8">
        <h2 className="heading-3 flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-indigo-600" />
          All Tasks & Assignments
        </h2>

        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
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
            className="form-input"
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
            className="form-input"
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
              className="btn-primary btn-sm flex-1"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="btn-secondary btn-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <ClipboardList className="empty-state-icon" />
          <h3 className="empty-state-title">No Tasks Found</h3>
          <p className="empty-state-description">
            Create your first task to get started with task management.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="card card-hover group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="heading-4 mb-2">{task.title}</h3>
                    <p className="body-text-sm mb-4 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-4 body-text-sm text-gray-500">
                      {task.week && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          Week {task.week}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          <button
                            onClick={() => {
                              if (task.dueDate) {
                                setTaskForDueDate({ id: task.id, currentDate: new Date(task.dueDate).toISOString().split('T')[0] });
                              }
                            }}
                            className="btn-icon text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            title="Change due date"
                          >
                            <Calendar size={14} />
                          </button>
                        </span>
                      )}
                      {!task.dueDate && (
                        <button
                          onClick={() => setTaskForDueDate({ id: task.id, currentDate: "" })}
                          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors"
                          title="Set due date"
                        >
                          <Calendar size={14} />
                          Set due date
                        </button>
                      )}
                    </div>

                    {/* Assigned Students */}
                    {task.StudentTask.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Assigned to:</p>
                        <div className="flex flex-wrap gap-2">
                          {task.StudentTask.map((st) => (
                            <motion.div
                              key={st.id}
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm border border-gray-200"
                            >
                              <User size={14} className="text-gray-500" />
                              <span className="text-gray-700 font-medium">{st.User.name || st.User.email}</span>
                              <span
                                className={`badge ${
                                  st.status === "COMPLETED"
                                    ? "badge-success"
                                    : st.status === "OVERDUE"
                                    ? "badge-danger"
                                    : "badge-warning"
                                }`}
                              >
                                {st.status.replace("_", " ")}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons Group */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewSubmissions(task.id)}
                      className="btn-icon text-blue-600 hover:bg-blue-50"
                      title="View submissions"
                    >
                      <Eye size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTask(task.id)}
                      className="btn-icon text-indigo-600 hover:bg-indigo-50"
                      title="Assign task"
                    >
                      <Plus size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTaskToEdit(task)}
                      className="btn-icon text-indigo-600 hover:bg-indigo-50"
                      title="Edit task"
                    >
                      <Edit size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTaskToDelete(task.id)}
                      className="btn-icon text-red-600 hover:bg-red-50"
                      title="Delete task"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Student Tasks List (Filtered) */}
      {studentTasks.length > 0 && (
        <div className="mt-8">
          <h3 className="heading-4 mb-4">Filtered Assignments</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {studentTasks.map((st, index) => (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="card card-hover"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="heading-4 mb-2">{st.Task.title}</h4>
                      <p className="body-text-sm mb-3">
                        Student: <span className="font-semibold text-gray-900">{st.User.name || st.User.email}</span>
                      </p>
                      <div className="flex items-center gap-4 body-text-sm text-gray-500">
                        {st.Task.week && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            Week {st.Task.week}
                          </span>
                        )}
                        {st.Task.dueDate && (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            Due: {new Date(st.Task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`badge ${
                          st.status === "COMPLETED"
                            ? "badge-success"
                            : st.status === "OVERDUE"
                            ? "badge-danger"
                            : "badge-warning"
                        }`}
                      >
                        {st.status.replace("_", " ")}
                      </span>
                      {st.status === "COMPLETED" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <AnimatePresence>
        {deleteSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="toast toast-success"
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Task deleted successfully</span>
            <button
              onClick={() => setDeleteSuccess(false)}
              className="ml-auto text-green-600 hover:text-green-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {deleteError && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="toast toast-error"
          >
            <X className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              className="ml-auto text-red-600 hover:text-red-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {taskToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isDeleting && setTaskToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-md w-full"
            >
              <h3 className="heading-4 mb-3">Delete Task</h3>
              <p className="body-text-sm mb-6">
                Are you sure you want to delete this task? This action cannot be undone and will also delete all related assignments and submissions.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setTaskToDelete(null)}
                  disabled={isDeleting}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTask(taskToDelete)}
                  disabled={isDeleting}
                  className="btn-danger btn-sm flex items-center gap-2"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Toast Notifications - Edit, Due Date, Review */}
      <AnimatePresence>
        {editSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ delay: 0.1 }}
            className="toast toast-success"
            style={{ top: '4rem' }}
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Task updated successfully</span>
            <button
              onClick={() => setEditSuccess(false)}
              className="ml-auto text-green-600 hover:text-green-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {editError && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ delay: 0.1 }}
            className="toast toast-error"
            style={{ top: '4rem' }}
          >
            <X className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{editError}</span>
            <button
              onClick={() => setEditError(null)}
              className="ml-auto text-red-600 hover:text-red-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {dueDateSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ delay: 0.2 }}
            className="toast toast-success"
            style={{ top: '8rem' }}
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Due date updated successfully</span>
            <button
              onClick={() => setDueDateSuccess(false)}
              className="ml-auto text-green-600 hover:text-green-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {dueDateError && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ delay: 0.2 }}
            className="toast toast-error"
            style={{ top: '8rem' }}
          >
            <X className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{dueDateError}</span>
            <button
              onClick={() => setDueDateError(null)}
              className="ml-auto text-red-600 hover:text-red-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {reviewSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ delay: 0.3 }}
            className="toast toast-success"
            style={{ top: '12rem' }}
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Submission reviewed successfully</span>
            <button
              onClick={() => setReviewSuccess(false)}
              className="ml-auto text-green-600 hover:text-green-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {reviewError && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ delay: 0.3 }}
            className="toast toast-error"
            style={{ top: '12rem' }}
          >
            <X className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{reviewError}</span>
            <button
              onClick={() => setReviewError(null)}
              className="ml-auto text-red-600 hover:text-red-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={!isLoading ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-4">Edit Task</h3>
          <button
            onClick={onClose}
            className="btn-icon text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Week Number</label>
              <input
                type="number"
                min="1"
                max="16"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary btn-sm flex items-center gap-2"
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
      </motion.div>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={!isLoading ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-4">Change Due Date</h3>
          <button
            onClick={onClose}
            className="btn-icon text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">
              New Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="form-input"
            />
            <p className="form-error text-gray-500">Cannot select past dates</p>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !newDate}
              className="btn-primary btn-sm flex items-center gap-2"
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
      </motion.div>
    </motion.div>
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
    if (status === "ACCEPTED" || status === "APPROVED") return "badge-success";
    if (status === "REJECTED") return "badge-danger";
    if (status === "PENDING") return "badge-warning";
    return "badge-gray";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-4">Task Submissions</h3>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              className="btn-secondary btn-sm"
              disabled={isLoading}
            >
              Refresh
            </motion.button>
            <button
              onClick={onClose}
              className="btn-icon text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
            <p className="body-text-sm mt-4">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="empty-state py-12">
            <ClipboardList className="empty-state-icon" />
            <h3 className="empty-state-title">No Submissions Yet</h3>
            <p className="empty-state-description">
              No students have submitted work for this task yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="card card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {submission.User?.name || submission.User?.email || "Unknown Student"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Submitted: {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {submission.answerText && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="body-text-sm text-gray-700 whitespace-pre-wrap">{submission.answerText}</p>
                      </div>
                    )}
                    {submission.fileUrl && (
                      <div className="mt-3">
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                        >
                          <Eye size={16} />
                          View submitted file
                        </a>
                      </div>
                    )}
                    {submission.feedback && (
                      <div className="mt-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-xs font-semibold text-yellow-800 mb-1.5 uppercase tracking-wide">Admin Feedback:</p>
                        <p className="body-text-sm text-yellow-700">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`badge ${getStatusBadge(submission.status)}`}>
                      {submission.status}
                    </span>
                    {submission.status === "PENDING" && (
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onReview(submission.id, "ACCEPTED")}
                          disabled={isReviewing === submission.id}
                          className="btn-primary btn-sm flex items-center gap-1.5"
                        >
                          {isReviewing === submission.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRejectingSubmission(submission.id)}
                          disabled={isReviewing === submission.id}
                          className="btn-danger btn-sm flex items-center gap-1.5"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Feedback Form */}
                <AnimatePresence>
                  {rejectingSubmission === submission.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
                    >
                      <label className="form-label">
                        Rejection Feedback <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectionFeedback}
                        onChange={(e) => setRejectionFeedback(e.target.value)}
                        rows={3}
                        className="form-input"
                        placeholder="Provide feedback for rejection..."
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleReject(submission.id)}
                          disabled={!rejectionFeedback.trim() || isReviewing === submission.id}
                          className="btn-danger btn-sm"
                        >
                          Submit Rejection
                        </button>
                        <button
                          onClick={() => {
                            setRejectingSubmission(null);
                            setRejectionFeedback("");
                          }}
                          className="btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

