import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { FolderKanban } from "lucide-react";
import ProjectListItem from "./ProjectListItem";

export default async function ProjectsPage() {
  const session = await requireAdmin();

  const submissions = await prisma.projectSubmission.findMany({
    include: { User: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Project Review Panel</h1>
        <p className="text-gray-600">Review and manage student project submissions</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-[#4F46E5]" />
            All Project Submissions ({submissions.length})
          </h2>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No project submissions yet</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <ProjectListItem key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

