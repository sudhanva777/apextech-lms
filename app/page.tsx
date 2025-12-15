import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import FeatureCards from "@/components/FeatureCards";
import ProgramHighlights from "@/components/ProgramHighlights";
import ToolsSection from "@/components/ToolsSection";

// Dynamic imports for below-the-fold content
const StudentJourney = dynamic(() => import("@/components/StudentJourney"), {
  ssr: true,
});
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  ssr: true,
});
const FinalCTA = dynamic(() => import("@/components/FinalCTA"), {
  ssr: true,
});

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <ProgramHighlights />
      <ToolsSection />
      <StudentJourney />
      <Testimonials />
      <FinalCTA />
    </>
  );
}

