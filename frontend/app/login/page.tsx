"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Lock, Mail, Terminal, LogIn } from "lucide-react";
import { toast } from "sonner";
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      toast.error("Missing Credentials", {
        description: "Please enter both operator email and passphrase.",
      });
      return;
    }

    console.log("🚀 Login triggered via Axios");
    setLoading(true);

    try {
      const res = await authApi.post("/login", { email, password });
      
      console.log("📡 Axios Response Status:", res.status);
      const data = res.data;
      console.log("📦 Axios Response Data:", data);

      if (data.accessToken && data.refreshToken) {
        console.log("✅ Login success");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        router.push("/dashboard");
      } else {
        console.log("❌ Invalid credentials structure");
        toast.error("Authentication Failed", {
          description: data.message || "Invalid payload returned.",
        });
        setLoading(false);
      }
    } catch (e: any) {
      console.error("❌ Network or Auth error:", e);
      let errorDescription = `Cannot reach backend. Check your local Wi-Fi & IP.`;
      
      if (e.response) {
        errorDescription = e.response.data?.message || "Invalid credentials rejected by server.";
      } else if (e.code === 'ECONNABORTED') {
        errorDescription = "Connection timed out. The backend server might be blocked by a Windows Firewall.";
      }

      toast.error("Authentication Error", {
        description: errorDescription,
      });

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden dark">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md p-4">
        <Card className="border-primary/20 bg-card/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,255,0.05)]">
          <CardHeader className="space-y-4 items-center">
            <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
              <Fingerprint className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 border border-primary/50 rounded-xl animate-ping opacity-20"></div>
            </div>

            <div className="text-center space-y-1">
              <CardTitle className="text-2xl font-black uppercase tracking-wider text-primary">
                Identity Access
              </CardTitle>
              <CardDescription className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Quantum Link Authorization
              </CardDescription>
            </div>
          </CardHeader>

          <div className="flex flex-col">
            <CardContent className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  placeholder="OPERATOR EMAIL"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  spellCheck="false"
                  className="pl-9 font-mono bg-background/50"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  placeholder="PASSPHRASE"
                  autoComplete="current-password"
                  className="pl-9 font-mono bg-background/50"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && email && password && login()}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="button"
                onClick={login}
                disabled={loading}
                className="w-full font-mono font-bold uppercase active:scale-95 transition-transform"
                variant="outline"
              >
                {loading ? (
                  <Terminal className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {loading ? "Authenticating..." : "Initialize Link"}
              </Button>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}