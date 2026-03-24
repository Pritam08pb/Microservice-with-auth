"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getValidToken } from "@/lib/auth";
import { connectSocket } from "@/services/socket";
import {
  setMyUserId,
  setIncomingCaller,
  setLkToken,
  setStatus,
  resetCallState
} from "@/store/features/callSlice";
import { executeAcceptCall, executeRejectCall } from "@/lib/socketActions";
import { format } from "date-fns";
import { Phone, PhoneOff, Radar, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// decode JWT helper
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
};

export default function GlobalSocketManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { status, incomingCaller } = useAppSelector((state) => state.call);
  
  const [dismissed, setDismissed] = useState(false);

  // Initialize the global socket connection Exactly ONCE
  useEffect(() => {
    let isActive = true;

    const initSocket = async () => {
      const token = await getValidToken();
      if (!token || !isActive) {
        dispatch(setStatus("Idle"));
        return;
      }

      const decoded = parseJwt(token);
      if (decoded?.userId) {
        dispatch(setMyUserId(decoded.userId));
      }

      const s = connectSocket(token);

      // Prevent duplicate listeners
      s.off("connect");
      s.off("incoming-call");
      s.off("call-accepted");
      s.off("call-rejected");
      s.off("user-offline");
      s.off("user-busy");
      s.off("already-in-call");
      s.off("call-ended");
      s.off("disconnect");

      // Critical React StrictMode bugfix: If socket connected instantly before this effect, manually sequence connection
      if (s.connected) {
        dispatch(setStatus("Connected"));
      }

      s.on("connect", () => {
        dispatch(setStatus("Connected"));
      });

      s.on("incoming-call", (data: any) => {
        setDismissed(false); // Reset dismissal on new call
        dispatch(setIncomingCaller(data.fromUserId));
        dispatch(setStatus("Incoming call"));
      });

      s.on("call-accepted", (data: any) => {
        dispatch(setStatus("Call connected 🎥"));
        dispatch(setLkToken(data.token));
      });

      s.on("call-rejected", () => {
        dispatch(setStatus("Call rejected ❌"));
        setTimeout(() => dispatch(resetCallState()), 3000);
      });

      s.on("user-offline", () => {
        dispatch(setStatus("Call rejected ❌"));
        setTimeout(() => dispatch(resetCallState()), 3000);
      });

      s.on("user-busy", () => {
        dispatch(setStatus("Call rejected ❌"));
        setTimeout(() => dispatch(resetCallState()), 3000);
      });

      s.on("already-in-call", () => {
        dispatch(setStatus("Call rejected ❌"));
        setTimeout(() => dispatch(resetCallState()), 3000);
      });

      s.on("call-ended", () => {
        dispatch(setStatus("Call ended 📴"));
        setTimeout(() => dispatch(resetCallState()), 2000);
      });

      s.on("disconnect", () => {
        dispatch(setStatus("Idle"));
      });
    };

    initSocket();

    return () => {
      isActive = false;
    };
  }, [dispatch]);

  // Is an incoming call popping up globally? (Hide if on /call strictly OR if user dismissed)
  const isIncoming = status === "Incoming call" && incomingCaller !== null && pathname !== "/call" && !dismissed;

  const handleAccept = () => {
    if (incomingCaller) {
      executeAcceptCall(incomingCaller);
      if (pathname !== "/call") {
        router.push("/call");
      }
    }
  };

  const handleReject = () => {
    if (incomingCaller) {
      executeRejectCall(incomingCaller);
    }
  };

  return (
    <>
      {children}

      {/* GLOBAL INCOMING CALL OVERLAY */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-500 ${isIncoming ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {isIncoming && (
          <div className="relative animate-in zoom-in-95 duration-300">
            {/* Pulsing Aura */}
            <div className="absolute -inset-10 bg-destructive/20 rounded-full blur-3xl animate-pulse"></div>
            
            <div className="relative bg-card border border-destructive/50 shadow-[0_0_50px_rgba(239,68,68,0.15)] rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center">
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-muted-foreground hover:text-white"
                onClick={() => setDismissed(true)}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                 <div className="absolute inset-0 border border-destructive rounded-full animate-ping opacity-40"></div>
                 <div className="absolute inset-2 border border-destructive/60 rounded-full animate-[ping_2s_ease-in-out_infinite_1s] opacity-40"></div>
                 <div className="bg-destructive/10 p-5 rounded-full border border-destructive/30">
                    <Radar className="w-10 h-10 text-destructive animate-[spin_4s_linear_infinite]" />
                 </div>
              </div>

              <h2 className="text-destructive font-mono font-bold tracking-[0.3em] uppercase mb-2 animate-pulse">
                Incoming Link
              </h2>
              
              <div className="bg-background/50 w-full border border-border rounded-lg p-4 mb-8">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Source Node</p>
                <p className="font-mono text-lg text-foreground truncate">{incomingCaller}</p>
                <div className="mt-2 text-xs text-muted-foreground font-mono">
                  {format(new Date(), "HH:mm:ss.SSS")}
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <Button 
                  size="lg" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono uppercase tracking-widest"
                  onClick={handleAccept}
                >
                  <Phone className="w-4 h-4 mr-2" /> Accept
                </Button>
                <Button 
                  size="lg" 
                  variant="destructive" 
                  className="flex-1 font-mono uppercase tracking-widest"
                  onClick={handleReject}
                >
                  <PhoneOff className="w-4 h-4 mr-2" /> Reject
                </Button>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
