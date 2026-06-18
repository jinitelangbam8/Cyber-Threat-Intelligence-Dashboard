import React, { useState } from "react";
import { 
  Shield, Activity, Globe, Compass, AlertCircle, Loader2, MapPin, 
  Wifi, HelpCircle, Network, UserCheck, Terminal 
} from "lucide-react";
import { ThreatScan } from "../types";

interface Props {
  onAddScan: (scan: ThreatScan) => void;
  onToast: (msg: string, isMalicious: boolean) => void;
}

export default function IpIntelligence({ onAddScan, onToast }: Props) {
  const [ipInput, setIpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeScan, setActiveScan] = useState<ThreatScan | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipInput.trim()) return;

    // Basic regex parser for IP validation (supports IPv4 or IPv6 placeholder formats)
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    
    if (!ipv4Regex.test(ipInput) && !ipv6Regex.test(ipInput)) {
      setErrorMsg("Invalid IP Format. Specify a sound IPv4 (e.g. 8.8.8.8) or IPv6 address.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    setActiveScan(null);

    try {
      const res = await fetch("/api/ip-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ipInput })
      });

      if (!res.ok) {
        throw new Error("Failed to secure IP report from intelligence networks.");
      }

      const report: ThreatScan = await res.json();
      
      // Delay slightly for analysis loading feedback realism
      setTimeout(() => {
        setActiveScan(report);
        onAddScan(report);
        setLoading(false);

        if (report.threatScore! > 70) {
          onToast(`ALERT: IP ${report.value} identified as risk node of abuse score: ${report.abuseScore}%`, true);
        } else {
          onToast(`IP intelligence scan completed for target node: ${report.value}`, false);
        }
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "IP Analyzer network request failed.");
      setLoading(false);
    }
  };

  return (
    <div id="ip-intelligence-module" className="space-y-6">
      
      {/* Query Banner */}
      <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none" />
        <div className="max-w-xl">
          <h1 className="text-xl font-bold font-mono tracking-wider text-white uppercase mb-2">IP REPUTATION & GEOLOCATION INTEL</h1>
          <p className="text-xs text-slate-400 font-sans">
            Audit inbound connection footprints. Parses target ASN blocks, determines GeoIP coordinates, probes Tor exit routing flags, and outputs public abuse registers records.
          </p>
        </div>

        <form onSubmit={handleScan} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Wifi className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              id="ip-threat-input"
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g., 185.220.101.4 or 8.8.8.8"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-705/40 bg-slate-800/40 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
              disabled={loading}
            />
          </div>
          <button 
            id="ip-intel-submit"
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            PROBE HOSTNODE
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-950/20 text-xs font-mono text-red-200 shadow-xl">
            ⚠ AUDIT HALTED: {errorMsg}
          </div>
        )}
      </div>

      {loading && (
        <div className="p-8 rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-md shadow-xl flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">PROBING PUBLIC WHOIS AND ASN BLOCKS...</p>
        </div>
      )}

      {/* Audit Output */}
      {activeScan && !loading && (
        <div className="space-y-6">
          
          {/* IP Summary Header columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* IP Specific Metrics Card */}
            <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">AUDIT TARGET NODE</span>
                <h2 className="text-2xl font-black font-mono text-white mt-1 mb-4">{activeScan.value}</h2>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                  <span className="text-slate-500">VPN Proxy</span>
                  <span className={`font-semibold ${activeScan.vpnDetection?.includes("Detected") ? "text-orange-400" : "text-slate-400"}`}>
                    {activeScan.vpnDetection}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/40 font-semibold">
                  <span className="text-slate-500">Tor Exit Node</span>
                  <span className={activeScan.torDetection?.includes("Exit") ? "text-red-400 animate-pulse" : "text-slate-400"}>
                    {activeScan.torDetection}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Abuse Ratio</span>
                  <span className={`font-bold ${activeScan.abuseScore! > 40 ? "text-red-400" : "text-emerald-400"}`}>
                    {activeScan.abuseScore}% Score
                  </span>
                </div>
              </div>
            </div>

            {/* AI Security Evaluation panel */}
            <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md md:col-span-2 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Terminal className="h-4 w-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest">CO-PILOT AI REPORT</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Network Segment Abuse Assessment</h3>
                <p id="ip-ai-explanation" className="text-xs text-slate-300 leading-relaxed font-mono">
                  {activeScan.aiExplanation}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>SECTARGET: {activeScan.organization}</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  activeScan.abuseScore! > 60 ? "bg-red-950/40 text-red-100 border border-red-500/20 animate-cyber-pulse" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {activeScan.riskLevel} Risk level
                </span>
              </div>
            </div>

          </div>

          {/* Details & Location layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Public Registry Details */}
            <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md shadow-xl">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Network className="h-4 w-4 text-blue-400" />
                Administrative ASN registries WHOIS
              </h3>
              <div className="space-y-3 text-xs font-mono text-slate-300">
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">ISP Provider</span>
                  <span className="font-semibold">{activeScan.isp}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">ASN Block ID</span>
                  <span>{activeScan.asn}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">Holder Org</span>
                  <span>{activeScan.organization}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">Country Registry</span>
                  <span>{activeScan.country}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">City Segment</span>
                  <span>{activeScan.city}</span>
                </div>
              </div>
            </div>

            {/* Geographical visualization mapping box */}
            <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  Geographical Node Localization Map
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mb-4">
                  Coordinates: Lat {activeScan.geolocation?.lat.toFixed(4)}, Lon {activeScan.geolocation?.lon.toFixed(4)}
                </p>
              </div>

              {/* Styled Vector Map Mockup container */}
              <div className="h-32 w-full rounded-xl border border-slate-800/50 bg-slate-900/20 flex flex-col items-center justify-center relative overflow-hidden p-4 backdrop-blur-sm">
                <div className="absolute inset-0 opacity-[0.03] flex flex-wrap gap-2 text-[8px] font-mono uppercase pointer-events-none text-slate-550 select-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <span key={i}>01010010 NETWORK GEO GRID LOC MAP DATAMATCH KEY VALID RESOLVED STACK ...</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 relative bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-lg text-xs font-mono shadow-md">
                  <div className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>{activeScan.city}, {activeScan.country}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
                GeoIP values resolved from central global country-route databases.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
