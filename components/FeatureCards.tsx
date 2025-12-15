"use client";

import { memo } from "react";
import { School, BookOpen, Clock, Briefcase, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: School,
    title: "Hands-on Real Learning",
    description: "Learn by doing with practical tasks and real-world projects.",
  },
  {
    icon: BookOpen,
    title: "Industry-Relevant Curriculum",
    description: "Curriculum designed to match current industry requirements.",
  },
  {
    icon: Clock,
    title: "1–3 Month Structured Tracks",
    description: "Flexible duration options to fit your schedule and goals.",
  },
  {
    icon: Briefcase,
    title: "Internship Included",
    description: "Gain real experience through our internship program.",
  },
  {
    icon: Users,
    title: "Personal Mentor Support",
    description: "Get guidance from experienced mentors throughout your journey.",
  },
  {
    icon: DollarSign,
    title: "Affordable & Student Friendly",
    description: "Quality education at prices accessible to all students.",
  },
];

function FeatureCards() {
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
            Why Choose Apex Tech Innovation
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Building industry-ready tech talent across AI, ML, and Full-Stack Engineering
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <feature.icon className="h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(FeatureCards);
