"use client";

import Link from "next/link";
import { Eye, FileText, Github, CheckCircle, XCircle, Clock } from "lucide-react";

interface ProjectListItemProps {
  submission: {
    id: string;
    title: string;
    description: string;
    status: string;
    fileUrl: string | null;
    githubRepo: string | null;
    submittedAt: Date;
    User: {
      name: string | null;
      email: string | null;
    };
  };
}

export default function ProjectListItem({ submission }: ProjectListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5" />;
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return <Clock className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <Link
      href={`/admin/projects/${submission.id}`}
      className="block p-6 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{submission.title}</h3>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                submission.status
              )}`}
            >
              {getStatusIcon(submission.status)}
              {submission.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {submission.description}
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>Student: {submission.User.name || submission.User.email || "N/A"}</span>
            <span>
              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            {submission.fileUrl && (
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[#4F46E5] hover:underline text-sm"
              >
                <FileText size={16} />
                View File
              </a>
            )}
            {submission.githubRepo && (
              <a
                href={submission.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[#4F46E5] hover:underline text-sm"
              >
                <Github size={16} />
                GitHub Repo
              </a>
            )}
          </div>
        </div>
        <Eye className="h-5 w-5 text-gray-400 ml-4" />
      </div>
    </Link>
  );
}

