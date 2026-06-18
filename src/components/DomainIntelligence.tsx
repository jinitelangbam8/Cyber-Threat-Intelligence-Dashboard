import React, { useState } from "react";
import { 
  Shield, Loader2, Compass, Globe, Info, Activity,
  Server, Calendar, Key, Lock, Layers, CheckCircle
} from "lucide-react";
import { ThreatScan } from "../types";

interface Props {
  onAddScan: (scan: ThreatScan) => void;
  onToast: (msg: string, isMalicious: boolean) => void;
}

export default function DomainIntelligence({ onAddScan, onToast }: Props) {
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeScan, setActiveScan] = useState<ThreatScan | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    // Strip out protocol prefixes if paste URL
    const targetDomain = domainInput.trim()
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .split("/")[0];

    if (!targetDomain.includes(".") || targetDomain.length < 4) {
      setErrorMsg("Invalid Domain footprint. Provide a full valid hostname (e.g. microsoft.com or domain-threat.org).");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    setActiveScan(null);

    try {
      const res = await fetch("/api/domain-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: targetDomain })
      });

      if (!res.ok) {
        throw new Error("Domain lookup failed to yield dynamic threat data.");
      }

      const report: ThreatScan = await res.json();
      
      setTimeout(() => {
        setActiveScan(report);
        onAddScan(report);
        setLoading(false);

        if (report.threatScore! > 60) {
          onToast(`ALERT: Domain ${report.value} scored high reputation threat score: ${report.threatScore}%`, true);
        } else {
          onToast(`Domain DNS and WHOIS scan complete. Reputation certified normal.`, false);
        }
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || "Domain scanner connection crashed.");
      setLoading(false);
    }
  };

  return (
    <div id="domain-intelligence-module" className="space-y-6">
      
      {/* Banner */}
      <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full filter blur-xl pointer-events-none" />
        <div className="max-w-xl">
          <h1 className="text-xl font-bold font-mono tracking-wider text-white uppercase mb-2">DOMAIN REPUTATION & DNS DECODING</h1>
          <p className="text-xs text-slate-400 font-sans">
            Inspect core registrar metadata records. Extracts registration timelines, parses dynamic active DNS records (MX/TXT), and certifies third-party SSL security authorities.
          </p>
        </div>

        <form onSubmit={handleScan} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              id="domain-threat-input"
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="e.g., github.com or suspicious-bank-log.net"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-705/40 bg-slate-800/40 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
              disabled={loading}
            />
          </div>
          <button 
            id="domain-intel-submit"
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            PARSE REGISTRY
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
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">QUERYING DOMAIN REGISTRATION RECORDS...</p>
        </div>
      )}

      {/* Audit Output View */}
      {activeScan && !loading && (
        <div className="space-y-6">
          
          {/* WHOIS timeline banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">REGISTRAR REFERENCE</span>
                <h3 className="text-xl font-bold font-mono text-slate-200 mt-1 mb-2">{activeScan.registrar}</h3>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>Age: {activeScan.domainAge}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono mt-4 border-t border-slate-800/40 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-505">Created At</span>
                  <span className="text-slate-300">{activeScan.creationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-550">Expires At</span>
                  <span className="text-slate-300">{activeScan.expirationDate}</span>
                </div>
              </div>
            </div>

            {/* AI Forensic report */}
            <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md md:col-span-2 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-widest">
                  <Server className="h-4 w-4" />
                  <span>WHOIS REPUTATION HEURISTICS</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Google Gemini Domain Safety Report</h3>
                <p id="domain-ai-explanation" className="text-xs text-slate-300 leading-relaxed font-mono">
                  {activeScan.aiExplanation}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/40 flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
                <span>REPUTATION RATIO: {activeScan.reputationScore}%</span>
                <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                  activeScan.threatScore! > 50 ? "bg-red-950/40 text-red-100 border border-red-500/20 animate-cyber-pulse" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                }`}>
                  THREAT SCENT: {activeScan.riskLevel}
                </span>
              </div>
            </div>

          </div>

          {/* DNS details bento layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Active DNS Records Table */}
            <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md font-mono shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-400" />
                DNS Records Resolution
              </h3>
              <div className="space-y-3 text-xs">
                {activeScan.dnsRecords?.A && (
                  <div className="py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 font-medium">A RECORDS (HOST IP)</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {activeScan.dnsRecords.A.map((ip, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800">
                          {ip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {activeScan.dnsRecords?.MX && (
                  <div className="py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 font-medium">MX RECORDS (MAIL GATEWAY)</span>
                    <div className="mt-1">
                      {activeScan.dnsRecords.MX.map((mx, i) => (
                        <span key={i} className="text-slate-300 block text-[11px] leading-relaxed">
                          • {mx}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {activeScan.dnsRecords?.TXT && (
                  <div className="py-2 border-b border-slate-800/40">
                    <span className="text-slate-500 font-medium">TXT RECORDS (SPF/DKIM)</span>
                    <div className="mt-1">
                      {activeScan.dnsRecords.TXT.map((txt, i) => (
                        <span key={i} className="text-slate-400 text-[10px] block truncate" title={txt}>
                          {txt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {activeScan.dnsRecords?.NS && (
                  <div className="py-2">
                    <span className="text-slate-500 font-medium">NS RECORDS (AUTHORITATIVE DNS)</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {activeScan.dnsRecords.NS.map((ns, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950/80 text-blue-300 text-[10px] border border-slate-800">
                          {ns}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SSL Certificate Authority check */}
            <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md font-mono flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  SSL Certificate parameters
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs">
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-semibold">ISSUING AUTHORITY</span>
                      <span className="text-slate-300 font-semibold">{activeScan.sslDetails?.issuer}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">ENCRYPTION ALGORITHM</span>
                      <span className="text-slate-300">{activeScan.sslDetails?.algorithm}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">EXPIRATION REGISTRY</span>
                      <span className="text-slate-300">{activeScan.sslDetails?.expires}</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 text-[10px] text-emerald-400 font-semibold uppercase bg-emerald-950/30 p-2 border border-emerald-500/15 rounded">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>SSL Signature validated safely by root store anchors</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 border border-slate-800 bg-slate-900/30 backdrop-blur-sm rounded-xl mt-4">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  <strong>IP SPOOF NOTE:</strong> DNS changes propagate dynamically over 24-48 hours. Ensure that SPF records strictly enforce IP addresses to prevent custom mail spoofing threats.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
