"use client";

import Link from "next/link";
import { Cpu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden dark">
      {/* Deep Background Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-3xl">
        
        <div className="relative flex justify-center items-center w-24 h-24 mb-10">
          <div className="absolute inset-0 border border-primary/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-[-8px] border-t-2 border-r-2 border-primary/50 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
          <Cpu className="w-10 h-10 text-primary relative z-10" />
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-foreground">
          HE<span className="text-primary">LP</span>Y
        </h1>
        
        <p className="text-muted-foreground font-mono text-sm md:text-base tracking-[0.3em] uppercase mb-12 leading-relaxed">
          Advanced Telemetry Protocol & Secure Video Routing
        </p>

        <Button 
          asChild
          size="lg" 
          className="h-14 px-8 font-mono font-bold tracking-[0.2em] uppercase group"
        >
          <Link href="/login">
            Establish Connection
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>

      </div>
    </div>
  );
}
