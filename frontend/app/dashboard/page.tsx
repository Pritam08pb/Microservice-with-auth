"use client";

import { useRouter } from "next/navigation";
import { Network, Activity, Shield, Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden dark">
      {/* Network Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="relative z-10 border-b border-border bg-card/50 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-primary" />
          <span className="font-bold tracking-widest uppercase text-primary">Helpy Command</span>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="font-mono text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
            SYS: ONLINE
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => { import("@/lib/auth").then(m => m.logoutSession()); }} className="font-mono text-xs text-muted-foreground hover:text-primary">
            DISCONNECT
          </Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative flex-1 z-10 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-8">
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">
              Operator <span className="text-primary">Dashboard</span>
            </h1>
            <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Global Communication Node Active</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/40 border-primary/20 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute -right-4 -top-4 bg-primary/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
              <CardContent className="p-6">
                <Shield className="w-6 h-6 text-primary mb-4" />
                <div className="text-3xl font-mono text-foreground font-bold mb-1">SECURE</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Network Status</div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-purple-500/20 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/50 transition-colors">
               <div className="absolute -right-4 -top-4 bg-purple-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              <CardContent className="p-6">
                <Activity className="w-6 h-6 text-purple-400 mb-4" />
                <div className="text-3xl font-mono text-foreground font-bold mb-1">0ms</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Latency Overhead</div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-emerald-500/20 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
               <div className="absolute -right-4 -top-4 bg-emerald-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <CardContent className="p-6">
                <Users className="w-6 h-6 text-emerald-400 mb-4" />
                <div className="text-3xl font-mono text-foreground font-bold mb-1">Online</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Peers Available</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-8">
            <Button size="lg" onClick={() => router.push("/call")} className="font-mono font-bold uppercase tracking-[0.2em] px-8 h-14 bg-primary text-primary-foreground hover:bg-primary/90 gap-3 group">
              Access Quantum Link
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}