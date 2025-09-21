import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { cn } from "../../lib/utils";
import { useWallet } from "../../hooks/useWallet";

export default function Header() {
  const { address, isConnecting, connect, disconnect } = useWallet();

  const short = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_30px_-10px] shadow-cyan-500/60 grid place-items-center">
            <span className="text-background font-black select-none">S</span>
          </div>
          <div className="leading-tight">
            <div className="font-bold tracking-tight text-foreground">SentinelX</div>
            <div className="text-[11px] text-muted-foreground">Real-Time Risk & Sentiment Oracle for DeFi</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={address ? disconnect : connect}
            disabled={isConnecting}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              "bg-gradient-to-r from-cyan-500 to-violet-500 text-white",
              "hover:from-cyan-400 hover:to-violet-400",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "shadow-[0_10px_30px_-12px] shadow-cyan-500/50",
            )}
          >
            <Wallet className="h-4 w-4" />
            {address ? short : isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      </div>
    </header>
  );
}
