import Link from "next/link";
import CurriculumTimeline from "@/components/CurriculumTimeline";
import { Code2, BarChart3, AreaChart, Calculator, Cpu, FileText, FolderKanban } from "lucide-react";
import { RadialGlowBackground } from "@/components/SVGBackgrounds";

const learningPoints = [
  {
    icon: Code2,
    title: "Python for Data",
    description: "Master Python programming for data analysis",
  },
  {
    icon: BarChart3,
    title: "Pandas & Data Analysis",
    description: "Learn data manipulation and analysis",
  },
  {
    icon: AreaChart,
    title: "Visualization",
    description: "Create compelling data visualizations",
  },
  {
    icon: Calculator,
    title: "Statistics",
    description: "Understand statistical concepts and methods",
  },
  {
    icon: Cpu,
    title: "ML Basics",
    description: "Introduction to Machine Learning",
  },
  {
    icon: FileText,
    title: "Report Writing",
    description: "Learn to document and present findings",
  },
  {
    icon: FolderKanban,
    title: "Major Project",
    description: "Complete one comprehensive project",
  },
];

const outcomes = [
  "Clean & analyze data effectively",
  "Build interactive dashboards",
  "Train simple ML models",
  "Create professional reports",
  "Present findings confidently",
  "Complete one major industry-level project",
];

const tracks = [
  {
    name: "1-Month Fast Track",
    duration: "4 weeks",
    description: "Intensive program for quick learners",
    features: ["Core concepts", "Essential tools", "One project"],
  },
  {
    name: "2-Month Standard Track",
    duration: "8 weeks",
    description: "Balanced learning with practice time",
    features: ["Comprehensive curriculum", "Weekly assignments", "Major project", "Internship"],
  },
  {
    name: "3-Month Deep Learning Track",
    duration: "12 weeks",
    description: "Extended program with advanced topics",
    features: ["All standard features", "Advanced ML", "Multiple projects", "Extended internship"],
  },
];

export default function Program() {
  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="section-padding bg-[#F8FAFC] relative overflow-hidden">
        <RadialGlowBackground />
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              Apex Tech Innovation{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Training Programs
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Building industry-ready tech talent across Data Science, AI Engineering, ML, and Full-Stack Systems. Beginner-friendly, practical, and job-oriented.
            </p>
          </div>
        </div>
      </section>

      {/* What You Will Learn */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              What You Will Learn
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive curriculum designed for real-world application
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {learningPoints.map((point, index) => (
              <div key={index} className="card hover:scale-105 transition-transform duration-300">
                <point.icon size={32} strokeWidth={2} className="text-[#4F46E5] mb-4 icon-glow" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {point.title}
                </h3>
                <p className="text-gray-600">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Timeline */}
      <CurriculumTimeline />

      {/* Learning Outcomes */}
      <section className="section-padding bg-[#EEF2FF]">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Learning Outcomes
              </h2>
              <p className="text-lg text-gray-600">
                By the end of this program, students can:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {outcomes.map((outcome, index) => (
                <div key={index} className="card flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <p className="text-gray-700 font-medium">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Program Tracks */}
      <section className="section-padding bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Program Tracks
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the track that fits your schedule and goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tracks.map((track, index) => (
              <div
                key={index}
                className={`card text-center ${
                  index === 1
                    ? "border-2 border-primary shadow-xl scale-105"
                    : ""
                }`}
              >
                {index === 1 && (
                  <div className="bg-primary text-white py-1 px-4 rounded-full text-sm font-semibold mb-4 inline-block">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {track.name}
                </h3>
                <p className="text-primary font-semibold mb-4">{track.duration}</p>
                <p className="text-gray-600 mb-6">{track.description}</p>
                <ul className="space-y-2 text-left mb-6">
                  {track.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-2">
                      <span className="text-primary font-bold">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="btn-primary w-full inline-block text-center"
                >
                  Enroll Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Major Project CTA */}
      <section className="section-padding bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#3B82F6] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent)]" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg">
              Complete Your Major Project
            </h2>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Every student completes one major real-world project as part of the program.
            </p>
            <Link
              href="/project"
              className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#3B82F6] hover:bg-gray-50 font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-2xl hover:shadow-white/20 transform hover:scale-[1.02] inline-block relative"
            >
              <span className="relative z-10">Learn More About Projects</span>
              <div className="absolute inset-0 bg-white rounded-full" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

