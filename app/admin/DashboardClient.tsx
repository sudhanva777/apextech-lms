"use client";

import { memo, useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Avatar from "@/components/Avatar";

interface CountUpProps {
  initialValue: number;
}

interface RecentStudent {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  StudentProfile: {
    programTrack: string | null;
    status: string | null;
  } | null;
}

interface RecentSubmission {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  User: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface StudentsListProps {
  recentStudents: RecentStudent[];
  recentSubmissions: RecentSubmission[];
}

// Count-up animation component for KPI cards
export function AdminDashboardClient({ initialValue }: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { stiffness: 50, damping: 30 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(initialValue);
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [initialValue, spring, display]);

  return (
    <motion.p
      className="text-2xl font-bold text-slate-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayValue.toLocaleString()}
    </motion.p>
  );
}

// Students list component
export function StudentsList({ recentStudents, recentSubmissions }: StudentsListProps) {
  return (
    <>
      {/* Students List */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {recentStudents.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
            No students yet
          </div>
        ) : (
          recentStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/admin/students/${student.id}`}
                className="group block px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    src={student.image}
                    name={student.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {student.name || "N/A"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {student.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.StudentProfile?.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {student.StudentProfile?.status || "INACTIVE"}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
}
