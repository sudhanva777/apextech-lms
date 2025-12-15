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
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Hear from Our Students
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See how our program has transformed careers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              <div className="border-t border-slate-200 pt-4">
                <p className="font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-sm text-slate-600 mt-1">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
