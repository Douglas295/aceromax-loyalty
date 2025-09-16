import Benefits from "@/components/home/Benefits";
import Footer from "@/components/layout/Footer";
import HowItWorks from "@/components/home/HowItWorks";
import ExcelForms from "@/components/home/ExcelForms";
import HeroSection from "@/components/home/HeroSection";

export default function Home() {
  return (
      <div className="min-w-screen bg-transparent mt-16">
        <HeroSection />
        <HowItWorks />
        <Benefits />
        <ExcelForms />
        <Footer />
      </div>
  );
}
