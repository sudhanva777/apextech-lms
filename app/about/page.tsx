import React from "react";
import { Target, Lightbulb, Users, GraduationCap } from "lucide-react";
import TeamMembers from "@/components/TeamMembers";
import { RadialGlowBackground } from "@/components/SVGBackgrounds";

export default function About() {
  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="section-padding bg-[#F8FAFC] relative overflow-hidden">
        <RadialGlowBackground />
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              About{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Apex Tech Innovation
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Building industry-ready tech talent across AI, ML, Data Science, and Full-Stack Engineering
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-padding bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed mb-4">
                Apex Tech Innovation Pvt Ltd is an online-first tech training platform focused on building industry-ready talent across Data Science, AI Engineering, Machine Learning, and Full-Stack Systems. We teach practical, job-oriented skills through hands-on tasks, real-world projects, and internship experiences.
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                We believe the best way to learn tech is by doing. Our curriculum bridges the gap between theory and real-world application, ensuring students are job-ready from day one. Beyond Data Science, we're building a comprehensive ecosystem for tech professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-[#EEF2FF]">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-8 text-center">
              <Target size={32} strokeWidth={2} className="text-[#4F46E5] mx-auto mb-4 icon-glow" />
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">Our Mission</h3>
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                To provide practical tech education across AI, ML, Data Science, and Full-Stack Engineering, accessible to all students.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-8 text-center">
              <Lightbulb size={32} strokeWidth={2} className="text-[#4F46E5] mx-auto mb-4 icon-glow" />
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">Our Vision</h3>
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                To build India's most trusted tech training ecosystem, empowering professionals across AI, ML, Data Science, and Full-Stack Engineering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Philosophy */}
      <section className="section-padding bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 text-center">
              Our Training Philosophy
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6">
                <GraduationCap size={32} strokeWidth={2} className="text-[#4F46E5] mb-3 icon-glow" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Learn by Doing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Hands-on practice is at the core of our teaching methodology.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6">
                <Lightbulb size={32} strokeWidth={2} className="text-[#4F46E5] mb-3 icon-glow" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {"Practical Tasks > Theory"}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We prioritize real-world application over theoretical concepts.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6">
                <Users size={32} strokeWidth={2} className="text-[#4F46E5] mb-3 icon-glow" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Student-Focused Learning
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Every student gets personalized attention and support.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6">
                <Target size={32} strokeWidth={2} className="text-[#4F46E5] mb-3 icon-glow" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Outcome-Based Training
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our goal is to make you job-ready, not just certificate-ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="section-padding bg-[#EEF2FF]">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 text-center">
              Who This Is For
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Students</h3>
                <p className="text-gray-600 leading-relaxed">
                  Current students looking to add Data Science skills to their portfolio.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh Graduates</h3>
                <p className="text-gray-600 leading-relaxed">
                  Recent graduates seeking to enter the Data Science field.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Switchers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Professionals looking to transition into Data Science careers.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Anyone Wanting Data Science Skills</h3>
                <p className="text-gray-600 leading-relaxed">
                  Anyone with the passion and dedication to learn Data Science.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <TeamMembers />
    </div>
  );
}

