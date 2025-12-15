"use client";

import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 text-white py-10 md:py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent)]" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Apex Tech Innovation
          </h2>
          <p className="text-lg md:text-xl mb-8 text-indigo-100 leading-relaxed">
            Build industry-ready skills across Data Science, AI Engineering, ML, and Full-Stack Systems. Join our ecosystem of tech professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              <Phone className="mr-2 h-4 w-4" />
              Book Counselling
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
