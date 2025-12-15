"use client";

import { memo } from "react";
import { School, BookOpen, Clock, Briefcase, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: School,
    title: "Hands-on Real Learning",
    description: "Learn by doing with practical tasks and real-world datasets.",
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
    <section className="bg-slate-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We provide the best learning experience for aspiring Data Scientists
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <feature.icon className="h-10 w-10 text-[#4F46E5] mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(FeatureCards);
