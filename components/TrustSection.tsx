"use client";

import { memo } from "react";
import { Briefcase, Award, Users, Code } from "lucide-react";
import { motion } from "framer-motion";

const trustItems = [
  {
    icon: Briefcase,
    title: "Industry Projects",
    description: "Real-world client projects",
    gradient: "from-indigo-500/10 to-indigo-600/5",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  {
    icon: Award,
    title: "Certification",
    description: "Industry-recognized credentials",
    gradient: "from-purple-500/10 to-purple-600/5",
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: Users,
    title: "Real Mentorship",
    description: "1-on-1 guidance from experts",
    gradient: "from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: Code,
    title: "Internship Experience",
    description: "Hands-on professional training",
    gradient: "from-green-500/10 to-green-600/5",
    iconColor: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
];

function TrustSection() {
  return (
    <section className="bg-white dark:bg-slate-900 py-10 md:py-12 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trustItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className={`group relative bg-gradient-to-br ${item.gradient} rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer`}
            >
              <div className={`inline-flex p-3 rounded-xl ${item.iconBg} group-hover:scale-110 transition-transform mb-4`}>
                <item.icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 text-sm md:text-base">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TrustSection);
