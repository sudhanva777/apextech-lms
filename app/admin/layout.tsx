import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopNav from "@/components/AdminTopNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/student");

  // Get full user data for avatar
  const adminUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopNav user={adminUser} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

