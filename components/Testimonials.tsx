"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Data Science Graduate",
    content:
      "The hands-on approach and real-world project helped me land my first job as a Data Analyst. The mentors were always supportive!",
    rating: 5,
  },
  {
    name: "Rahul Kumar",
    role: "Career Switcher",
    content:
      "Coming from a non-tech background, I was worried. But the beginner-friendly curriculum and practical tasks made learning easy and fun.",
    rating: 5,
  },
  {
    name: "Anjali Patel",
    role: "Fresh Graduate",
    content:
      "The internship experience was invaluable. Working on real tasks gave me confidence and practical skills that employers value.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "Data Science Graduate",
    content:
      "The major project was challenging but rewarding. It became the centerpiece of my portfolio and helped me stand out in interviews.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    role: "Data Analyst",
    content:
      "Affordable pricing and flexible schedule made it perfect for me. The 2-month track was intensive but worth every minute!",
    rating: 5,
  },
];

export default function Testimonials() {
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
            What Our Students Say
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Real experiences from our Apex Tech Innovation community
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed text-sm">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {testimonial.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
