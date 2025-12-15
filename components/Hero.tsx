"use client";

import { memo, useState, useEffect } from "react";
import Link from "next/link";
import { Download, Phone, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const rotatingKeywords = [
  "Data Science",
  "Machine Learning",
  "AI Engineering",
  "Full-Stack Systems",
];

function Hero() {
  const [currentKeyword, setCurrentKeyword] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKeyword((prev) => (prev + 1) % rotatingKeywords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent" />
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1), transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Company Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-indigo-200/50 rounded-full mb-6 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">
              Apex Tech Innovation Pvt Ltd
            </span>
          </motion.div>

          {/* Main Heading with Rotating Keywords */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight"
          >
            Building Industry-Ready{" "}
            <br className="hidden md:block" />
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentKeyword}
                  initial={{ opacity: 0, y: 20, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, rotateX: 90 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"
                >
                  {rotatingKeywords[currentKeyword]}
                </motion.span>
              </AnimatePresence>
            </span>{" "}
            Talent
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto"
          >
            Transform your career with hands-on training, real-world projects, and industry mentorship. 
            Join our ecosystem of tech professionals.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#programs"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md"
            >
              <Download className="mr-2 h-4 w-4" />
              Explore Programs
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md"
            >
              <Phone className="mr-2 h-4 w-4" />
              Book Call
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default memo(Hero);
