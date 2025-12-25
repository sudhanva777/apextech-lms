import React from "react";
import Image from "next/image";

const teamMembers = [
  {
    name: "Dilip S Angadi",
    role: "Founder & CEO",
    image: "/team/dilip.jpg",
    description:
      "Founder of Apex Tech Innovation Pvt Ltd, leading the mission to create a practical, job-focused Data Science training ecosystem.",
  },
  {
    name: "Sudhanva Patil",
    role: "Founder & CEO",
    image: "/team/sudhanva.jpg",
    description:
      "Oversees curriculum design, learning pathways, major project structure, and student training experience.",
  },
];

function TeamMembers() {
  return (
    <section className="section-padding bg-[#FAFAFF]">
      <div className="container-custom">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Meet Our Leadership Team
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            The visionaries behind Apex Tech Innovation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 p-8 text-center group"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Profile Picture with Gradient Ring */}
              <div className="mb-6 flex justify-center">
                <div className="relative w-40 h-40 animate-float" style={{ animationDelay: `${index * 0.3}s` }}>
                  {/* Gradient Ring Border */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#3B82F6] p-1 shadow-xl shadow-indigo-500/30">
                    <div className="w-full h-full rounded-full bg-white overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover rounded-full"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                {member.name}
              </h3>
              <p className="gradient-text font-semibold text-lg mb-4">
                {member.role}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamMembers;
