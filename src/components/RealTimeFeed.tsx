import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, ShieldAlert, Wifi, Globe, MapPin, Radio, 
  Terminal, ShieldCheck as ShieldSafe, Activity, RefreshCw 
} from "lucide-react";
import { LiveThreatAlert } from "../types";

export default function RealTimeFeed() {
  const [feedItems, setFeedItems] = useState<LiveThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await fetch("/api/threat-feed");
      if (!res.ok) throw new Error();
      const report: LiveThreatAlert[] = await res.json();
      setFeedItems(report);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Failed to load real-time threat items.");
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const pollTimer = setInterval(() => {
      fetchFeed();
    }, 30000); // 30 seconds refresh cycle

    return () => clearInterval(pollTimer);
  }, [autoRefresh]);

  const flags: Record<string, string> = {
    US: "🇺🇸", DE: "🇩🇪", CN: "🇨🇳", NL: "🇳🇱", RU: "🇷🇺", SG: "🇸🇬", JP: "🇯🇵", 
    UA: "🇺🇦", BR: "🇧🇷", IN: "🇮🇳", GB: "🇬🇧", CA: "🇨🇦"
  };

  return (
    <div id="realtime-feed-module" className="space-y-6">
      
      {/* Header bar and indicators */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-blue-500 animate-pulse" />
            <h1 className="text-sm font-black font-mono tracking-wider text-white uppercase">ENTERPRISE ATTACK SURFACE STREAM FEED</h1>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Global honeypot data streams, actively polling malicious IP logs, ransomware campaigns, and command-escalation attempts.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 shadow-sm">
            <span className="bg-blue-500 h-1.5 w-1.5 rounded-full animate-ping" />
            <span>POLL SPEED: 30S</span>
          </div>

          <button 
            id="force-refresh-feed"
            onClick={fetchFeed} 
            className="p-1 px-2.5 rounded bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer shadow"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            REFRESH
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs">
          <Activity className="h-6 w-6 text-blue-400 animate-spin mx-auto mb-2" />
          ESTABLISHING SECURE CONNECTION CORE FEEDS...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 font-mono">
          {feedItems.map((item, idx) => (
            <div 
              key={item.id} 
              className="p-4 rounded-xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/45 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
              id={`feed-item-${item.id}`}
            >
              
              <div className="flex items-start md:items-center gap-4">
                
                {/* Visual score indicators */}
                <div className={`h-11 w-11 rounded-full flex flex-col items-center justify-center shrink-0 border ${
                  item.threatScore > 85 ? "bg-red-950/40 border-red-500/20 text-red-500 shadow-md shadow-red-500/10" :
                  item.threatScore > 60 ? "bg-orange-950/40 border-orange-500/20 text-orange-400" :
                  "bg-amber-950/40 border-amber-500/20 text-amber-500"
                }`}>
                  <span className="text-[9px] font-bold">SCORE</span>
                  <span className="text-sm font-black tracking-tighter leading-none">{item.threatScore}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white font-extrabold text-sm">{item.category}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-805">
                      {item.vector}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.riskLevel === "Critical" ? "bg-red-950/60 text-red-300 animate-cyber-pulse" :
                      item.riskLevel === "High" ? "bg-orange-950/60 text-orange-300" :
                      "bg-amber-950/60 text-amber-300"
                    }`}>
                      {item.riskLevel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="text-[12px]">{flags[item.country] || "🌐"}</span>
                      <span>Origin Geo: {item.country}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-305 font-semibold" title="Source Malicious IP">{item.senderIp}</span>
                    <span>•</span>
                    <span>Target Node: {item.target}</span>
                  </div>
                </div>

              </div>

              {/* Timestamp block */}
              <div className="text-[10px] text-slate-550 shrink-0 text-left md:text-right font-mono self-end md:self-center">
                <span>DETECTED INDEX</span>
                <span className="block text-slate-400 font-semibold mt-0.5">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
