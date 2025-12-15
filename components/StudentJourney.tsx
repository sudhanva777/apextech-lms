"use client";

import { ClipboardCheck, UserPlus, BookOpen, FolderKanban, Briefcase, GraduationCap, Briefcase as JobIcon } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Apply",
    description: "Submit your application",
  },
  {
    icon: UserPlus,
    title: "Join the Program",
    description: "Get onboarded and set up",
  },
  {
    icon: BookOpen,
    title: "Learn + Weekly Tasks",
    description: "Complete weekly assignments",
  },
  {
    icon: FolderKanban,
    title: "One Major Project",
    description: "Build your portfolio project",
  },
  {
    icon: Briefcase,
    title: "Internship Tasks",
    description: "Gain real-world experience",
  },
  {
    icon: GraduationCap,
    title: "Certification",
    description: "Receive your certificate",
  },
  {
    icon: JobIcon,
    title: "Job Applications",
    description: "Start your career journey",
  },
];

export default function StudentJourney() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900 py-10 md:py-12">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Your Learning Journey
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            From application to career-ready professional
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-center shadow-sm hover:shadow-md transition-all"
            >
              <step.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
