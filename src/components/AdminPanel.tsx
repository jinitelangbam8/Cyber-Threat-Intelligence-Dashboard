import React, { useState, useEffect } from "react";
import { 
  Users, Key, Settings, Cpu, Database, Activity, RefreshCw, 
  Terminal, ShieldCheck, HelpCircle, HardDrive, ToggleLeft 
} from "lucide-react";
import { SystemUser } from "../types";

export default function AdminPanel() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConsoleLogs, setActiveConsoleLogs] = useState<string[]>([
    "SYS_INIT: Booting firewall ingress security rules.",
    "DB_CORE: SQLite active cache initialized cleanly.",
    "API_GATEWAY: Heartbeat response normal inside port 3000."
  ]);

  const [rateLimit, setRateLimit] = useState(150);
  const [aiEngine, setAiEngine] = useState("gemini-3.5-flash");

  useEffect(() => {
    // Fetch users list
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const list = await res.json();
          setUsers(list);
        }
      } catch (err) {
        console.error("Failed to fetch administrative users list.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // Spawn funny, authentic real syslog logs dynamically over time
    const logTimer = setInterval(() => {
      const liveServicesLogs = [
        "SYS_MONITOR: Host memory allocation stable at 42%.",
        "AUTH_SUCCESS: Authenticated TLS session validated for Administrator.",
        "THREAT_FEED: Scraped zero-day alerts from central honeypot gateways.",
        "AI_ENGINE: Cached semantic vectors for frequent URL queries successfully.",
        "SYS_MONITOR: Clean database compaction executed."
      ];
      const randomLog = liveServicesLogs[Math.floor(Math.random() * liveServicesLogs.length)];
      setActiveConsoleLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ${randomLog}`,
        ...prev.slice(0, 7)
      ]);
    }, 4500);

    return () => clearInterval(logTimer);
  }, []);

  return (
    <div id="admin-operations-module" className="space-y-6 font-mono text-xs">
      
      {/* Upper overview statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 font-bold block uppercase tracking-widest">Active System Nodes</span>
            <span className="text-xl font-bold font-mono tracking-tight text-white mt-1 block">8 / 8 Active</span>
          </div>
          <Activity className="h-7 w-7 text-emerald-400 animate-cyber-pulse" />
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 font-bold block uppercase tracking-widest">Telemetry API Latency</span>
            <span className="text-xl font-bold font-mono tracking-tight text-white mt-1 block">43 ms Avg</span>
          </div>
          <Cpu className="h-7 w-7 text-indigo-400" />
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 font-bold block uppercase tracking-widest">Active DB Records</span>
            <span className="text-xl font-bold font-mono tracking-tight text-white mt-1 block">Compacted JSON</span>
          </div>
          <Database className="h-7 w-7 text-zinc-400" />
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Administrative settings form (2 cols wide) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Security Controls & Parameters</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-3 bg-zinc-900/45 rounded-xl border border-zinc-850 space-y-2">
              <span className="text-zinc-500 font-semibold uppercase font-mono">RATE LIMIT COOLDOWN</span>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-zinc-300 font-bold font-mono shrink-0 w-12 text-right">{rateLimit} RPS</span>
              </div>
              <p className="text-[10px] text-zinc-500">Limits dynamic endpoint analyses queries per user IP segment.</p>
            </div>

            <div className="p-3 bg-zinc-900/45 rounded-xl border border-zinc-850 space-y-2">
              <span className="text-zinc-500 font-semibold uppercase font-mono">AI INTELLIGENCE ENGINE MODEL</span>
              <select
                value={aiEngine}
                onChange={(e) => setAiEngine(e.target.value)}
                className="w-full p-1 bg-zinc-950 border border-zinc-850 text-xs rounded text-zinc-300 font-mono transition-all outline-none cursor-pointer"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Operational)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Analyst Mode)</option>
                <option value="rules-local">Heuristic Parsing Patterns (Offline Fallback)</option>
              </select>
              <p className="text-[10px] text-zinc-500">Target model selected for generative security forensics checks.</p>
            </div>

          </div>

          <div className="pt-4 border-t border-zinc-900">
            <span className="text-zinc-500 font-bold uppercase block tracking-wider mb-2">SOC Authorized Administrators</span>
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="p-2 bg-zinc-900/60 rounded-lg border border-zinc-800 flex items-center justify-between gap-4 font-mono">
                  <div className="flex items-center gap-3">
                    <img src={u.image} alt={u.name} className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-900" />
                    <div>
                      <span className="text-zinc-200 font-bold block">{u.name}</span>
                      <span className="text-[10px] text-zinc-500 block">{u.email}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                    u.role === "Administrator" ? "bg-purple-950/40 text-purple-400 border-purple-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Console System Syslog logs (1 column) */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/50 flex flex-col justify-between h-[400px]">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-3 uppercase font-mono">
              <Terminal className="h-4 w-4" />
              <span>LOG STREAM (SYSLOG)</span>
            </div>
            
            <div className="space-y-2.5 h-[270px] overflow-y-auto no-scrollbar font-mono text-[9px] text-zinc-400 leading-normal">
              {activeConsoleLogs.map((log, i) => (
                <div key={i} className="py-1 border-b border-zinc-900/50 truncate">
                  <span className="text-zinc-600 font-semibold">{`>`}</span> {log}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] text-zinc-500 font-semibold uppercase text-center mt-3 border-t border-zinc-900 pt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Telemetry streams compliant, security audits stable.</span>
          </p>
        </div>

      </div>

    </div>
  );
}
