"use client";

import { memo, useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  gradient: string;
  delay?: number;
}

function KPICard({ label, value, icon: Icon, iconColor, gradient, delay = 0 }: KPICardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Gradient accent strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`} />
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {count}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 group-hover:scale-110 transition-transform ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

export default memo(KPICard);
