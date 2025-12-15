"use client";

import { motion } from "framer-motion";

const tools = [
  "Python",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "Seaborn",
  "Excel",
  "PowerBI",
  "Jupyter Notebook",
  "Sklearn",
];

export default function ToolsSection() {
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
            Tools You Learn
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Master industry-standard tools used by Data Scientists worldwide
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all"
            >
              {tool}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
