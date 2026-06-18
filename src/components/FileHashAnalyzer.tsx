import React, { useState } from "react";
import { 
  Shield, Activity, Hash, AlertTriangle, CheckCircle, HelpCircle, 
  Loader2, Cpu, FileText, ClipboardList, RefreshCw, Terminal, BellRing
} from "lucide-react";
import { ThreatScan } from "../types";

interface Props {
  onAddScan: (scan: ThreatScan) => void;
  onToast: (msg: string, isMalicious: boolean) => void;
}

export default function FileHashAnalyzer({ onAddScan, onToast }: Props) {
  const [hashInput, setHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeScan, setActiveScan] = useState<ThreatScan | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;

    const trimmed = hashInput.trim();
    if (trimmed.length !== 32 && trimmed.length !== 40 && trimmed.length !== 64) {
      setErrorMsg("Invalid Length! Hash checksum must measure exactly 32 (MD5), 40 (SHA1), or 64 (SHA256) characters hex string.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    setActiveScan(null);

    try {
      const res = await fetch("/api/hash-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: trimmed })
      });

      if (!res.ok) {
        throw new Error("Forensic database lookup failed to verify binary state.");
      }

      const report: ThreatScan = await res.json();
      
      setTimeout(() => {
        setActiveScan(report);
        onAddScan(report);
        setLoading(false);

        if (report.threatScore! > 75) {
          onToast(`CRITICAL FILE SIGNATURE! Malware footprint discovered: ${report.malwareFamily}`, true);
        } else {
          onToast(`Cryptographic binary check verified safe.`, false);
        }
      }, 1400);

    } catch (err: any) {
      setErrorMsg(err.message || "Hash query execution network failure.");
      setLoading(false);
    }
  };

  return (
    <div id="file-hash-analyzer-module" className="space-y-6">
      
      {/* Banner Input Card */}
      <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none" />
        <div className="max-w-xl">
          <h1 className="text-xl font-bold font-mono tracking-wider text-white uppercase mb-2">MALWARE HASH CRYPT SYSTEM</h1>
          <p className="text-xs text-slate-400 font-sans">
            Submit suspicious executable or dynamic asset signatures. Performs direct hash checklist audit for recognized WannaCry, Mirai, Mimikatz, and CobaltStrike footprints.
          </p>
        </div>

        <form onSubmit={handleScan} className="mt-6 flex flex-col sm:flex-row gap-3 font-mono">
          <div className="relative flex-1">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              id="hash-threat-input"
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Submit checksum, e.g. WannaCry (4a5e1e4baab89f3a32518a88c31bc87c61cd31a5e1f13b632fa5a73a3b02ce31)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-705/40 bg-slate-800/40 text-xs text-slate-200 placeholder-slate-550 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
              disabled={loading}
            />
          </div>
          <button 
            id="hash-analyzer-submit"
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            RUN SIGN-CHECK
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-950/20 text-xs font-mono text-red-200 shadow-xl">
            ⚠ REJECTED: {errorMsg}
          </div>
        )}
      </div>

      {loading && (
        <div className="p-8 rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-md shadow-xl flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">VALIDATING CRYPTOGRAPHIC INDEXES...</p>
        </div>
      )}

      {/* Audit Output Result */}
      {activeScan && !loading && (
        <div className="space-y-6 font-mono">
          
          {/* Malware signature header panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Direct Indicators */}
            <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">SIGNATURE CHECK REPORT</span>
                <h3 className="text-sm font-bold text-red-500 mt-1 mb-3">{activeScan.malwareFamily}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  Detected Category: {activeScan.threatCategory}
                </p>
              </div>

              <div className="space-y-2 text-xs mt-4 border-t border-slate-800/40 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Scan Check ratio</span>
                  <span className="text-slate-300 font-semibold">{activeScan.malwareRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vulnerability Threat</span>
                  <span className={`font-black ${activeScan.threatScore! > 70 ? "text-red-500 animate-pulse animate-cyber-pulse" : "text-emerald-505"}`}>
                    {activeScan.threatScore}/100 Score
                  </span>
                </div>
              </div>
            </div>

            {/* AI Analytical panel */}
            <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md md:col-span-2 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-400 text-xs font-bold uppercase tracking-widest">
                  <Terminal className="h-4 w-4" />
                  <span>AI VERIFY CO-PILOT ANALYSIS</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Cryptographic Binary Signature assessment</h3>
                <p id="hash-ai-explanation" className="text-xs text-slate-300 leading-relaxed font-mono">
                  {activeScan.aiExplanation}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/40 flex items-center justify-between text-[10px] font-mono text-slate-500 font-semibold">
                <span>HASH DIGEST COMPLIANCE CHECKED ONLINE</span>
                <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                  activeScan.threatScore! > 60 ? "bg-red-950/40 text-red-100 border border-red-500/20" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                }`}>
                  STRETCH INDEX: {activeScan.riskLevel}
                </span>
              </div>
            </div>

          </div>

          {/* Guidelines layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Recommendation checklist */}
            <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-blue-400" />
                  SOC Quarantine Recommendations
                </h3>
                <div className="space-y-3">
                  {activeScan.recommendations?.map((rec, i) => (
                    <div key={i} className="flex gap-3 text-xs leading-relaxed">
                      <div className="h-5 w-5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                        {i + 1}
                      </div>
                      <p className="text-slate-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* General Technical Reference box */}
            <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Forensic footprint analysis metadata
                </h3>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                  Cryptographic verification resolves submitted checksum digests directly with modern threat signature catalogs from central incident databases.
                </p>
              </div>

              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/40 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Digest Scheme</span>
                  <span className="text-slate-400 font-semibold uppercase">
                    {activeScan.value.length === 32 ? "MD5" : activeScan.value.length === 40 ? "SHA1" : "SHA256"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Host Target Scope</span>
                  <span className="text-slate-400">Memory Executable & Static DLL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Audit Status</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
