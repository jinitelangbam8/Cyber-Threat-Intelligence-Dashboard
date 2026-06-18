import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line 
} from "recharts";
import { 
  Activity, Shield, ShieldAlert, ShieldCheck, Zap, AlertTriangle, 
  Terminal, Globe, Cpu, Clock, HelpCircle 
} from "lucide-react";
import { ThreatScan } from "../types";

interface Props {
  scans: ThreatScan[];
  onNavigate: (tab: string) => void;
}

export default function CyberDashboard({ scans, onNavigate }: Props) {
  // Aggregate stats
  const totalScans = scans.length;
  const safeScans = scans.filter(s => s.riskLevel === "Safe").length;
  const highRiskScans = scans.filter(s => s.riskLevel === "High" || s.riskLevel === "Critical").length;
  const maliciousScans = scans.filter(s => s.riskLevel !== "Safe").length;

  // Pie chart aggregation
  const riskLevels = ["Safe", "Low", "Medium", "High", "Critical"];
  const pieData = riskLevels.map(level => {
    const count = scans.filter(s => s.riskLevel === level).length;
    return { name: level, value: count || (level === "Safe" ? 1 : 0) }; // avoid empty charts on start
  });

  const COLORS = {
    Safe: "#10b981",    // emerald
    Low: "#3b82f6",     // blue
    Medium: "#f59e0b",  // amber
    High: "#f97316",    // orange
    Critical: "#ef4444"  // red
  };

  // Bar chart aggregation: scan types
  const types = ["url", "ip", "domain", "hash"];
  const barData = types.map(t => {
    const count = scans.filter(s => s.type === t).length;
    return { 
      name: t.toUpperCase(), 
      Scans: count,
      Malicious: scans.filter(s => s.type === t && s.riskLevel !== "Safe").length 
    };
  });

  // Timeline data for Area chart (accumulate counts by minutes/hours)
  const timelineData = [
    { time: "06:00", Scans: 4, Threats: 2 },
    { time: "09:00", Scans: 8, Threats: 3 },
    { time: "12:00", Scans: 15, Threats: 7 },
    { time: "15:00", Scans: 23, Threats: 9 },
    { time: "18:00", Scans: 18, Threats: 6 },
    { time: "21:00", Scans: totalScans + 5, Threats: maliciousScans + 2 },
    { time: "Now", Scans: totalScans, Threats: maliciousScans }
  ];

  return (
    <div id="cyber-ops-dashboard" className="space-y-6">
      
      {/* Upper Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold font-mono tracking-wider text-white">SOC SECURITY OPERATIONS CENTER</h1>
            <p className="text-xs text-slate-400">Target system core online. AI-powered behavioral heuristics monitoring active.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            id="nav-to-analyzer-btn"
            onClick={() => onNavigate("url")} 
            className="px-3.5 py-2 rounded-xl border border-blue-500/30 bg-blue-600/15 text-xs font-mono text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer font-semibold shadow-lg shadow-blue-500/10"
          >
            + INITIALIZE SCAN
          </button>
          <button 
            id="nav-to-assistant-btn"
            onClick={() => onNavigate("assistant")} 
            className="px-3.5 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs font-mono text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer font-semibold"
          >
            ASK AI CO-PILOT
          </button>
        </div>
      </div>

      {/* Numerical Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Scans Card */}
        <div id="stat-total-scans" className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/50 flex items-center gap-4 shadow-xl hover:border-slate-700/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Scans</div>
            <div className="text-2xl font-bold text-white leading-tight mt-0.5">{totalScans}</div>
          </div>
        </div>

        {/* Safe Metrics Card */}
        <div id="stat-safe-scans" className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/50 flex items-center gap-4 shadow-xl hover:border-slate-700/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Safe URLs</div>
            <div className="text-2xl font-bold text-white leading-tight mt-0.5">
              {safeScans} <span className="text-xs text-slate-400 font-normal">({totalScans > 0 ? Math.round((safeScans / totalScans) * 100) : 100}%)</span>
            </div>
          </div>
        </div>

        {/* Malicious Detections */}
        <div id="stat-malicious-scans" className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/50 flex items-center gap-4 shadow-xl hover:border-slate-700/50 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Medium Risk</div>
            <div className="text-2xl font-bold text-white leading-tight mt-0.5">{maliciousScans}</div>
          </div>
        </div>

        {/* High Risk Threat level */}
        <div id="stat-high-scans" className="bg-red-500/10 backdrop-blur-md p-5 rounded-2xl border border-red-500/20 flex items-center gap-4 shadow-xl hover:border-red-500/30 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-red-400/80 text-xs font-medium uppercase tracking-wider">Critical Alerts</div>
            <div className="text-2xl font-bold text-white leading-tight mt-0.5">{highRiskScans}</div>
          </div>
        </div>
      </div>

      {/* Main Charts Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Threat Timeline Chart (Left & Mid column) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
          <div className="mb-4">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">Threat Scanning Volatility</h2>
            <p className="text-xs text-slate-400">Timelines of isolated payloads vs general telemetry queries</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Scans" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#scansGrad)" />
                <Area type="monotone" dataKey="Threats" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#threatsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Classification (Right column) */}
        <div id="chart-severity-pie" className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">Asset Security Classification</h2>
            <p className="text-xs text-slate-400">Severity split of current indexed intelligence assets</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text inside pie chart */}
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-mono text-slate-400">THREAT RATIO</span>
              <span className="text-xl font-bold text-red-500 font-mono">
                {totalScans > 0 ? Math.round((maliciousScans / totalScans) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {riskLevels.map((level) => {
              const val = scans.filter(s => s.riskLevel === level).length;
              return (
                <div key={level} className="text-center p-1.5 border border-slate-800/60 rounded-xl bg-slate-900/20">
                  <div className="text-[10px] font-mono font-medium text-slate-400">{level.toUpperCase()}</div>
                  <div className="text-xs font-bold font-mono" style={{ color: COLORS[level as keyof typeof COLORS] }}>
                    {val}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Malware Signature Vector Metrics (First column) */}
        <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md lg:col-span-1 flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">Scanning Vectors Distribution</h2>
            <p className="text-xs text-slate-400">Comparative density of security audits run per vector type</p>
          </div>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Scans" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Malicious" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Recent Audits feed (Mid and Right columns combined) */}
        <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md lg:col-span-2 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">Active Threat Ledger</h2>
              <p className="text-xs text-slate-400">Newly analyzed telemetry targets from recent audit checks</p>
            </div>
            <button 
              id="view-all-history-btn"
              onClick={() => onNavigate("history")} 
              className="px-2.5 py-1 text-slate-300 hover:text-white border border-slate-800 bg-slate-900/60 rounded-lg text-xs font-mono font-medium flex items-center gap-1 cursor-pointer transition-all"
            >
              FULL LEDGER →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 font-mono">
                  <th className="pb-2 font-medium">TARGET / RESOURCE</th>
                  <th className="pb-2 font-medium">TYPE</th>
                  <th className="pb-2 font-medium text-center">SCORE</th>
                  <th className="pb-2 font-medium">SEVERITY</th>
                  <th className="pb-2 font-medium">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {scans.slice(0, 4).map((scan) => (
                  <tr key={scan.id} className="border-b border-slate-900/40 hover:bg-slate-800/20 transition-all font-mono">
                    <td className="py-3 pr-2 text-slate-200 font-semibold truncate max-w-[200px]" title={scan.value}>
                      {scan.value}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950/40 border border-slate-800 text-slate-300 tracking-wider">
                        {scan.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-center text-white font-bold">{scan.threatScore}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        scan.riskLevel === "Safe" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" :
                        scan.riskLevel === "Low" ? "bg-blue-950/40 text-blue-400 border border-blue-500/20" :
                        scan.riskLevel === "Medium" ? "bg-amber-950/40 text-amber-400 border border-amber-500/20" :
                        scan.riskLevel === "High" ? "bg-orange-950/40 text-orange-400 border border-orange-500/20" :
                        "bg-red-950/40 text-red-400 border border-red-500/20 animate-pulse"
                      }`}>
                        {scan.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
                {scans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                      Telemetry registers are currently empty. Specify a scan to initiate indexing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
