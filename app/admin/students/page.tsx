import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, Eye, ClipboardList } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/Avatar";

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);

  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/student");

  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      createdAt: true,
      StudentProfile: {
        select: {
          programTrack: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
          Student Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">View and manage all registered students</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            All Students ({users.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Program Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No students found
                  </td>
                </tr>
              ) : (
                users.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={student.image}
                          name={student.name}
                          size="sm"
                        />
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {student.name || "N/A"}
                          </div>
                          {student.phone && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {student.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {student.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {student.StudentProfile?.programTrack || "Not enrolled"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.StudentProfile?.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {student.StudentProfile?.status || "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          <Eye size={16} />
                          View
                        </Link>
                        <Link
                          href={`/admin/tasks?assignTo=${student.id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          <ClipboardList size={16} />
                          Assign
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
