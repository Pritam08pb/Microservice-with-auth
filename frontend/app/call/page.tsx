"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setTargetUserId } from "@/store/features/callSlice";
import Room from "@/components/LiveKitRoom";
import { executeCallUser, executeAcceptCall, executeRejectCall, executeEndCall } from "@/lib/socketActions";
import {
  Phone,
  PhoneOff,
  Video,
  Activity,
  Cpu,
  Terminal,
  Wifi,
  RadioReceiver,
  Fingerprint,
  Copy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CallPage() {
  const dispatch = useAppDispatch();
  const {
    myUserId,
    targetUserId,
    incomingCaller,
    lkToken,
    status
  } = useAppSelector((state) => state.call);

  const isConnected = status === "Connected";
  const isIncoming = status === "Incoming call";
  const isCalling = status === "Calling...";
  const isCallActive = status === "Call connected 🎥";

  if (lkToken) {
    return <Room token={lkToken} onDisconnect={() => executeEndCall(null)} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden dark p-4">
      {/* Background Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="relative w-full max-w-2xl z-10">
        <Card className="bg-card/80 border-primary/20 backdrop-blur-xl shadow-[0_0_50px_rgba(0,255,255,0.05)] relative overflow-hidden">
          
          <CardHeader className="flex flex-row justify-between items-start border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-14 h-14 bg-primary/10 border border-primary/30 rounded-lg">
                <Cpu className="text-primary w-7 h-7" />
                <div className="absolute inset-0 border border-primary/50 rounded-lg animate-[ping_3s_ease-in-out_infinite] opacity-20"></div>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tighter uppercase text-foreground">
                  Quantum <span className="text-primary">Link</span>
                </CardTitle>
                <CardDescription className="font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                  <Fingerprint className="w-3 h-3" /> Encrypted Video Protocol
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider py-1.5 px-3 flex items-center gap-2 ${isConnected ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
                <Wifi className="w-3 h-3" />
                {isConnected ? 'Uplink Established' : 'System Offline'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => { import("@/lib/auth").then(m => m.logoutSession()); }} className="font-mono text-[10px] text-muted-foreground hover:text-primary">
                DISCONNECT
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 relative">
            
            {/* LOCAL INCOMING CALL OVERLAY */}
            <div className={`absolute inset-0 z-20 bg-background/95 backdrop-blur-md rounded-xl border border-destructive/50 flex flex-col items-center justify-center transition-all duration-300 ${isIncoming ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-[3px] border-destructive rounded-full animate-ping opacity-20"></div>
                  <Phone className="w-10 h-10 text-destructive animate-pulse" />
              </div>
              <div className="text-destructive font-mono text-sm tracking-[0.3em] uppercase mb-2 animate-pulse">Incoming Transmission</div>
              <div className="bg-muted px-6 py-3 rounded-lg border border-border mb-8 text-center min-w-[250px]">
                <div className="text-muted-foreground text-[10px] uppercase tracking-widest mb-1">Source ID</div>
                <div className="font-mono text-foreground truncate">{incomingCaller}</div>
              </div>
              <div className="flex gap-4 min-w-[250px]">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono tracking-widest" onClick={() => executeAcceptCall(incomingCaller!)}>
                  <Phone className="w-4 h-4 mr-2" /> ACCEPT
                </Button>
                <Button variant="destructive" className="flex-1 font-mono tracking-widest" onClick={() => executeRejectCall(incomingCaller!)}>
                  <PhoneOff className="w-4 h-4 mr-2" /> REJECT
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted/50 border border-border rounded-lg p-5 group hover:border-primary/30 transition-colors">
                  <h3 className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                    <Terminal className="w-4 h-4" /> Local Identity
                  </h3>
                  <div className="bg-background p-4 border-l-2 border-primary rounded-r-md cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigator.clipboard.writeText(myUserId)}>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Assigned Node ID</div>
                    <div className="font-mono text-sm text-foreground truncate flex justify-between items-center group-hover:text-primary transition-colors">
                       {myUserId || "INITIALIZING..."}
                       <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-5 flex flex-col justify-between group hover:border-purple-500/30 transition-colors">
                <div>
                  <h3 className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <RadioReceiver className="w-4 h-4" /> Remote Connection
                  </h3>
                  <Input 
                    placeholder="ENTER TARGET ID..."
                    value={targetUserId}
                    onChange={(e) => dispatch(setTargetUserId(e.target.value.trim()))}
                    disabled={isCalling || isCallActive}
                    className="font-mono uppercase bg-background focus-visible:ring-purple-500/50"
                  />
                </div>
                
                <Button 
                  onClick={() => executeCallUser(targetUserId)}
                  disabled={!targetUserId || isCalling || !isConnected}
                  className="w-full mt-6 font-mono font-bold tracking-widest uppercase bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Video className={`w-4 h-4 mr-2 ${isCalling ? 'animate-pulse' : ''}`} />
                  {isCalling ? 'Initiating...' : 'Establish Link'}
                </Button>
            </div>

          </CardContent>

          <CardFooter className="pt-4 border-t border-border flex justify-between items-center">
            <div className="flex items-center gap-2 text-primary">
              <Activity className="w-4 h-4" />
              <span className="font-mono text-xs tracking-widest uppercase">System Status</span>
            </div>
            <Badge variant="outline" className={`font-mono text-[10px] uppercase ${isCalling ? 'border-amber-500/50 text-amber-500 animate-pulse' : status.includes('rejected') ? 'border-destructive text-destructive' : 'border-primary/50 text-primary'}`}>
              {status}
            </Badge>
          </CardFooter>

        </Card>
      </div>
    </div>
  );
}