"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const programs = [
  {
    id: "data-science",
    title: "Data Science",
    status: "live",
    description: "Complete Data Science training with Python, ML, and real projects",
    duration: "3-4 months",
    href: "/program",
  },
  {
    id: "ml-engineer",
    title: "ML Engineer",
    status: "coming-soon",
    description: "Advanced Machine Learning Engineering track",
    duration: "2-4 months",
    href: "#",
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    status: "coming-soon",
    description: "Full-stack AI Engineering with modern frameworks",
    duration: "3-6 months",
    href: "#",
  },
  {
    id: "fullstack-ai",
    title: "Full Stack + AI",
    status: "planned",
    description: "Complete full-stack development with AI integration",
    duration: "4-8 months",
    href: "#",
  },
];

const statusConfig = {
  live: {
    label: "Live Now",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  "coming-soon": {
    label: "Coming Soon",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  planned: {
    label: "Planned",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Sparkles,
  },
};

function ProgramsPreview() {
  return (
    <section id="programs" className="bg-slate-50 py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Our Programs
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Comprehensive training tracks designed for industry readiness
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {programs.map((program, index) => {
            const status = statusConfig[program.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            const isClickable = program.status === "live";

            const CardContent = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all ${
                  isClickable ? "hover:border-indigo-300 cursor-pointer" : "opacity-75"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {program.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {program.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{program.duration}</span>
                  {isClickable && (
                    <ArrowRight className="h-4 w-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>

                {!isClickable && (
                  <div className="absolute inset-0 rounded-2xl bg-slate-50/50 backdrop-blur-[1px] pointer-events-none" />
                )}
              </motion.div>
            );

            return isClickable ? (
              <Link key={program.id} href={program.href}>
                {CardContent}
              </Link>
            ) : (
              <div key={program.id}>{CardContent}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(ProgramsPreview);

