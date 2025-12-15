"use client";

import { Code2, BarChart3, AreaChart, Calculator, Cpu, FolderKanban, ListChecks } from "lucide-react";
import { motion } from "framer-motion";

const highlights = [
  { icon: Code2, title: "Python", description: "Master Python for data science" },
  { icon: BarChart3, title: "Data Analysis", description: "Analyze real-world datasets" },
  { icon: AreaChart, title: "Visualization", description: "Create stunning visualizations" },
  { icon: Calculator, title: "Statistics", description: "Learn statistical concepts" },
  { icon: Cpu, title: "ML Basics", description: "Introduction to Machine Learning" },
  { icon: FolderKanban, title: "One Major Project", description: "Complete a real-world project" },
  { icon: ListChecks, title: "Internship Tasks", description: "Gain practical experience" },
];

export default function ProgramHighlights() {
  return (
    <section className="bg-white dark:bg-slate-900 py-10 md:py-12">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Program Highlights
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comprehensive training across Data Science, AI, and ML Engineering
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {highlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-center shadow-sm hover:shadow-md transition-all"
            >
              <highlight.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                {highlight.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {highlight.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
