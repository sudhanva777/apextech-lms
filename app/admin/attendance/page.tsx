import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Calendar, CheckCircle, XCircle, TrendingUp, Award, AlertCircle } from "lucide-react";
import AttendanceMarkingForm from "./AttendanceMarkingForm";

export default async function AdminAttendancePage() {
  const session = await requireAdmin();

  // Get all students
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      Attendance: {
        orderBy: { date: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate statistics for each student
  const studentStats = students.map((student) => {
    const totalDays = student.Attendance.length;
    const presentDays = student.Attendance.filter((a: { status: string }) => a.status === "PRESENT").length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    return {
      ...student,
      totalDays,
      presentDays,
      percentage,
    };
  });

  // Find highest and lowest attendance
  const sortedByPercentage = [...studentStats].sort((a, b) => b.percentage - a.percentage);
  const highest = sortedByPercentage[0];
  const lowest = sortedByPercentage[sortedByPercentage.length - 1];
  const classAverage =
    studentStats.length > 0
      ? Math.round(
          studentStats.reduce((sum, s) => sum + s.percentage, 0) / studentStats.length
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Attendance Management</h1>
        <p className="text-gray-600">Mark and manage student attendance</p>
      </div>

      {/* Summary Analytics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Highest Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {highest ? `${highest.percentage}%` : "N/A"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {highest?.name || highest?.email || "N/A"}
              </p>
            </div>
            <Award className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Lowest Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {lowest ? `${lowest.percentage}%` : "N/A"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {lowest?.name || lowest?.email || "N/A"}
              </p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Class Average</p>
              <p className="text-2xl font-bold text-gray-900">{classAverage}%</p>
              <p className="text-sm text-gray-500 mt-1">
                {students.length} {students.length === 1 ? "student" : "students"}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-[#4F46E5]" />
          </div>
        </div>
      </div>

      {/* Mark Attendance Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-[#4F46E5]" />
          Mark Attendance
        </h2>
        <AttendanceMarkingForm students={students} />
      </div>

      {/* Students List with Attendance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">All Students</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Present
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentStats.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name || student.email || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.totalDays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      <CheckCircle size={12} />
                      {student.presentDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                      <XCircle size={12} />
                      {student.totalDays - student.presentDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${
                        student.percentage >= 75
                          ? "text-green-600"
                          : student.percentage >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {student.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {students.length === 0 && (
          <div className="text-center py-12 text-gray-500">No students found</div>
        )}
      </div>
    </div>
  );
}

