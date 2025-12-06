import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ClipboardList, Plus, Filter } from "lucide-react";
import NewTaskForm from "./NewTaskForm";
import TaskList from "./TaskList";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { assignTo?: string; status?: string; week?: string; student?: string };
}) {
  const session = await requireAdmin();

  const assignToUserId = searchParams.assignTo;
  const statusFilter = searchParams.status;
  const weekFilter = searchParams.week ? parseInt(searchParams.week) : undefined;
  const studentFilter = searchParams.student;

  // Fetch all tasks
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      StudentTask: {
        include: { User: true },
      },
    },
  });

  // Fetch all students for filter
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
  });

  // Get all student tasks for filtering
  let studentTasks = await prisma.studentTask.findMany({
    include: {
      Task: true,
      User: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Apply filters
  if (statusFilter) {
    studentTasks = studentTasks.filter((st) => st.status === statusFilter);
  }
  if (weekFilter) {
    studentTasks = studentTasks.filter((st) => st.Task.week === weekFilter);
  }
  if (studentFilter) {
    studentTasks = studentTasks.filter((st) => st.userId === studentFilter);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Task Management</h1>
        <p className="text-gray-600">Create tasks and assign them to students</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create Task Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="h-6 w-6 text-[#4F46E5]" />
              Create New Task
            </h2>
            <NewTaskForm />
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2">
          <TaskList
            tasks={tasks}
            studentTasks={studentTasks}
            students={students}
            assignToUserId={assignToUserId}
          />
        </div>
      </div>
    </div>
  );
}

