"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, User, Calendar, Clock, CheckCircle, Plus } from "lucide-react";
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

export default function TaskList({ tasks, studentTasks, students, assignToUserId }: TaskListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [weekFilter, setWeekFilter] = useState(searchParams.get("week") || "");
  const [studentFilter, setStudentFilter] = useState(searchParams.get("student") || "");

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
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(task.id)}
                className="text-[#4F46E5] hover:text-[#4338ca] flex items-center gap-1 text-sm font-medium"
              >
                <Plus size={16} />
                Assign
              </button>
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

