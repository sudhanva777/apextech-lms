import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/Avatar";

export default async function AdminChatListPage() {
  const session = await getServerSession(authOptions);

  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/student");

  if (!user.email) {
    return <div>Error: No user email found</div>;
  }

  const admin = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true },
  });

  if (!admin) {
    return <div>Error: Admin not found</div>;
  }

  const messages = await prisma.message.findMany({
    where: {
      receiverId: admin.id,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      User_Message_senderIdToUser: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const studentsMap = new Map();

  messages.forEach((msg) => {
    const sender = msg.User_Message_senderIdToUser;

    if (sender?.role === "STUDENT" && !studentsMap.has(sender.id)) {
      studentsMap.set(sender.id, {
        id: sender.id,
        name: sender.name,
        email: sender.email,
        image: sender.image,
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt,
      });
    }
  });

  const students = Array.from(studentsMap.values());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
          Student Messages
        </h1>
        <p className="text-slate-600 dark:text-slate-400">View and respond to student messages</p>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
          <MessageCircle className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Messages Yet</h2>
          <p className="text-slate-600 dark:text-slate-400">Students haven't sent any messages yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Students ({students.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {students.map((student: any) => (
              <Link
                key={student.id}
                href={`/admin/chat/${student.id}`}
                className="block p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar
                      src={student.image}
                      name={student.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {student.name || student.email || "Student"}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                        {student.lastMessage}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {new Date(student.lastMessageTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <MessageCircle className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
