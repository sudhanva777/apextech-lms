"use client";

import { memo } from "react";
import Link from "next/link";
import { Download, Phone, School, UserCheck, FolderKanban, BadgeCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function Hero() {
  const highlights = [
    { text: "100% Practical Learning", icon: School },
    { text: "Beginner Friendly", icon: UserCheck },
    { text: "One Major Project", icon: FolderKanban },
    { text: "Internship Certificate", icon: BadgeCheck },
  ];

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight"
          >
            Become a Job-Ready{" "}
            <span className="text-[#4F46E5]">
              Data Scientist
            </span>{" "}
            in 1–3 Months
          </motion.h1>
          
          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            Apex Tech Innovation provides structured, hands-on Data Science training with one major real-world project and an internship experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#4F46E5] text-white font-semibold rounded-lg hover:bg-[#4338ca] transition-colors shadow-sm"
            >
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#syllabus"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Syllabus
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Phone className="mr-2 h-4 w-4" />
              Book Call
            </Link>
          </motion.div>

          {/* Highlights Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <highlight.icon className="h-8 w-8 text-[#4F46E5] mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-800">
                  {highlight.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default memo(Hero);
