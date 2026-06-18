import React, { useState } from "react";
import { 
  Globe, Shield, AlertTriangle, CheckCircle, HelpCircle, 
  ArrowRight, Key, Lock, Compass, ListChecks, Terminal, Loader2
} from "lucide-react";
import { ThreatScan } from "../types";

interface Props {
  onAddScan: (scan: ThreatScan) => void;
  onToast: (msg: string, isMalicious: boolean) => void;
}

export default function UrlAnalyzer({ onAddScan, onToast }: Props) {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeScan, setActiveScan] = useState<ThreatScan | null>(null);

  const steps = [
    "Validating URL string protocols & payload format",
    "Parsing domain names and scanning sub-hosts layout",
    "Analysing structural patterns & scanning malicious keyword signatures",
    "Querying SSL certificate validity registries",
    "Running Google Gemini Security co-pilot risk assessment"
  ];

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (!urlInput.toLowerCase().startsWith("http://") && !urlInput.toLowerCase().startsWith("https://")) {
      setErrorMsg("Protocol missing! Please include http:// or https:// at the beginning (e.g. https://google.com).");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    setActiveScan(null);
    setLoadingStep(0);

    // Play visual simulation for high-grade visual appeal
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    try {
      const res = await fetch("/api/url-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to scan URL target");
      }

      const report: ThreatScan = await res.json();
      
      // Delay response slightly to fully align scanning visual experience
      setTimeout(() => {
        setActiveScan(report);
        onAddScan(report);
        setLoading(false);
        clearInterval(stepInterval);

        // Toast feedback for threats
        if (report.threatScore > 75) {
          onToast(`CRITICAL THREAT: Phishing domain target registered high score: ${report.threatScore}!`, true);
        } else {
          onToast(`Scan complete. Target verified safe. Threat Score: ${report.threatScore}`, false);
        }
      }, 4800);

    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || "Threat analyzer network request crashed.");
      setLoading(false);
    }
  };

  return (
    <div id="url-analyzer-module" className="space-y-6">
      
      {/* Search Header card */}
      <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none" />
        <div className="max-w-2xl">
          <h1 className="text-xl font-bold font-mono tracking-wider text-white uppercase mb-2">URGENT URL THREAT DETECTOR</h1>
          <p className="text-xs text-slate-400">
            Submit a suspicious web coordinate or endpoint route below. Our automated analyzer parses protocols, parses dynamic keyword registries, details certificate profiles, and coordinates Gemini forensic lookups.
          </p>
        </div>

        <form onSubmit={handleScan} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              id="url-threat-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g., https://paypal-user-verification-login.servehttp.com/verify"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-705/40 bg-slate-800/40 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
              disabled={loading}
            />
          </div>
          <button 
            id="url-analyzer-submit"
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            SYSTEM AUDIT
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-950/20 text-xs font-mono text-red-200 shadow-xl">
            ⚠ ERROR: {errorMsg}
          </div>
        )}
      </div>

      {/* Interactive scanning workflow steps */}
      {loading && (
        <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-md shadow-xl font-mono space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
              HEURISTIC ENGINE CYCLES ACTIVE
            </span>
            <span className="text-xs text-blue-400">
              {Math.round(((loadingStep + 1) / steps.length) * 100)}% COMPLETE
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2 mt-4 text-xs">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {loadingStep > idx ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400 inline-shrink-0" />
                ) : loadingStep === idx ? (
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin inline-shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-700 bg-slate-900/60 inline-shrink-0" />
                )}
                <span className={idx <= loadingStep ? "text-slate-200 font-semibold" : "text-slate-500"}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finished Analysis Output Dashboard */}
      {activeScan && !loading && (
        <div className="space-y-6">
          
          {/* Main Risk Indicators Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Risk circular dial panel */}
            <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">Vulnerability Matrix Score</span>
              <div className="relative h-32 w-32 flex items-center justify-center mb-4">
                {/* Visual dial structure using custom concentric borders */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-805/40" />
                <div className={`absolute inset-0 rounded-full border-4 ${
                  activeScan.threatScore > 75 ? "border-red-500" :
                  activeScan.threatScore > 35 ? "border-amber-500" :
                  "border-emerald-500"
                } border-t-transparent`} />
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-extrabold font-mono text-white">{activeScan.threatScore}</span>
                  <span className="text-[10px] font-mono text-slate-500">MAX SCORE 100</span>
                </div>
              </div>
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                activeScan.riskLevel === "Safe" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" :
                activeScan.riskLevel === "High" || activeScan.riskLevel === "Critical" ? "bg-red-950/50 text-red-500 border border-red-500/20 animate-cyber-pulse" :
                "bg-amber-950/40 text-amber-500 border border-amber-500/20"
              }`}>
                {activeScan.riskLevel} RISK INDEX
              </span>
            </div>

            {/* AI Security Evaluation panel */}
            <div className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md md:col-span-2 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Terminal className="h-4 w-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest">CO-PILOT AI EXPLANATION</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Google Gemini Security Forensic Report</h3>
                <p id="ai-explanation-text" className="text-xs text-slate-300 leading-relaxed font-mono">
                  {activeScan.aiExplanation}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center gap-3 text-[10px] font-mono text-slate-500">
                <span>ANALYZER ID: {activeScan.id}</span>
                <span>•</span>
                <span>ENGINE VER: GEMINI-3.5-FLASH</span>
              </div>
            </div>
          </div>

          {/* Bento analysis findings tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* URL Structural Breakdown */}
            <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md shadow-xl">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Compass className="h-4 w-4 text-blue-400" />
                Structural Endpoint Anatomy
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">Target URL</span>
                  <span className="text-slate-300 truncate max-w-[240px]" title={activeScan.value}>{activeScan.value}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">RESOLVING HOST</span>
                  <span className="text-slate-300">{activeScan.hostname}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">PASSED PROTOCOL</span>
                  <span className={`font-semibold ${activeScan.protocol === "https:" ? "text-emerald-400" : "text-red-400"}`}>
                    {activeScan.protocol?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">ROUTING PATH</span>
                  <span className="text-slate-300 truncate max-w-[200px]" title={activeScan.pathPart}>{activeScan.pathPart || "/"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/40">
                  <span className="text-slate-500 font-medium">SSL SECURITY CERT</span>
                  <span className="text-slate-300">{activeScan.sslStatus}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">SUSPICIOUS SIGNATURES</span>
                  <span className="text-slate-300">
                    {activeScan.suspiciousKeywords && activeScan.suspiciousKeywords.length > 0 ? (
                      <span className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
                        {activeScan.suspiciousKeywords.join(", ")}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Zero flags found</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Enterprise actionable mitigations checklists */}
            <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-blue-400" />
                  Quarantine & Mitigation Controls
                </h3>
                <div className="space-y-3">
                  {activeScan.recommendations?.map((rec, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <div className="h-4.5 w-4.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                        {i + 1}
                      </div>
                      <p className="text-slate-300 font-mono">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-900/20 backdrop-blur-sm rounded-xl border border-slate-800/50">
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  <strong>SYSTEM MEMO:</strong> Always maintain client perimeter browser cookies/extensions active to prevent unauthorized remote script executions from dynamic servehosts.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
