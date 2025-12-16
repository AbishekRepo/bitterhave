import Image from "next/image";
import ServicesSection from "@/app/components/home/ServicesSection";
import Nav from "./components/home/Nav";
import HeroButtons from "@/app/components/home/HeroButtons";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-purple-500 selection:text-white bg-[#0a0a0a]">
      <Nav />

      <section className="container mx-auto pl-6 pb-5 pt-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 text-center lg:text-left z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white font-serif leading-[1.1]">
            Your AI Interview <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Co-Pilot
            </span>
          </h1>
          <div className="my-8 flex flex-col gap-3 text-sm text-gray-400 font-medium items-center lg:items-start">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
              <span>
                Paste a Job Description{" "}
                <span className="text-gray-600 mx-1">→</span> Get a full
                interview plan
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div>
              <span>
                Press a hotkey <span className="text-gray-600 mx-1">→</span> Get
                instant answers from screenshots
              </span>
            </div>
          </div>
          <HeroButtons />
        </div>
        <div className="hidden lg:block flex-1 relative w-full aspect-[4/3] lg:aspect-square max-h-[500px]">
          <div className="relative w-full h-full">
            <Image
              src="/hero-image-coding.png"
              alt="AI Interview Co-Pilot"
              fill
              className="object-cover object-center lg:object-[left_70%]"
              priority
            />
            {/* Gradient Blends */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent lg:w-2/3"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent h-1/3 mt-auto"></div>
          </div>
        </div>
      </section>

      <ServicesSection />
      <footer className="container mx-auto px-6 py-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Bitterhave. All rights reserved.
      </footer>
    </div>
  );
}
