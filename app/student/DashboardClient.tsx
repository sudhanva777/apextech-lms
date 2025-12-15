"use client";

import { memo } from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface RecentSubmission {
  status: string;
  createdAt: Date;
}

interface Props {
  recentSubmissions: RecentSubmission[];
}

function StudentDashboardClient({ recentSubmissions }: Props) {
  if (recentSubmissions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400 text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentSubmissions.map((submission, index) => {
        const statusConfig = {
          ACCEPTED: {
            icon: CheckCircle,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-900/10",
            label: "Accepted",
          },
          REJECTED: {
            icon: XCircle,
            color: "text-red-600 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-900/10",
            label: "Rejected",
          },
          PENDING: {
            icon: Clock,
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "bg-yellow-50 dark:bg-yellow-900/10",
            label: "Pending",
          },
        };

        const config = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.PENDING;
        const Icon = config.icon;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-3 ${config.bg} rounded-lg`}
          >
            <Icon className={`h-4 w-4 ${config.color}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Task Submission
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(submission.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default memo(StudentDashboardClient);

