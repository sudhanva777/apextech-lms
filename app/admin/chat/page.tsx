import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { MessageCircle, User } from "lucide-react";
import Link from "next/link";

export default async function AdminChatListPage() {
  const session = await requireAdmin();

  if (!session.user?.email) {
    return <div>Error: No user email found</div>;
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!admin) {
    return <div>Error: Admin not found</div>;
  }

  const messages = await prisma.message.findMany({
    where: {
      receiverId: admin.id,
    },
    include: {
      User_Message_senderIdToUser: {   // CORRECT RELATION NAME
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const studentsMap = new Map();

  messages.forEach((msg: { User_Message_senderIdToUser: { id: string; name: string | null; email: string | null; role: string } | null; content: string; createdAt: Date }) => {
    const sender = msg.User_Message_senderIdToUser; // FIXED FIELD

    if (sender?.role === "STUDENT" && !studentsMap.has(sender.id)) {
      studentsMap.set(sender.id, {
        id: sender.id,
        name: sender.name,
        email: sender.email,
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt,
      });
    }
  });

  const students = Array.from(studentsMap.values());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Student Messages</h1>
        <p className="text-gray-600">View and respond to student messages</p>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-12 text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Messages Yet</h2>
          <p className="text-gray-600">Students haven't sent any messages yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Students ({students.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {students.map((student) => (
              <Link
                key={student.id}
                href={`/admin/chat/${student.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#EEF2FF] rounded-lg">
                      <User className="h-6 w-6 text-[#4F46E5]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {student.name || student.email || "Student"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {student.lastMessage}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(student.lastMessageTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
