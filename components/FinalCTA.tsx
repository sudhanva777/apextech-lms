"use client";

import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white py-12 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Start Your Data Science Journey Today
          </h2>
          <p className="text-lg md:text-xl mb-10 text-indigo-100 leading-relaxed">
            Join hundreds of students who have transformed their careers with our practical Data Science program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#4F46E5] font-semibold rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
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
