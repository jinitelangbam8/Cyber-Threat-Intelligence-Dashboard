import React, { useState } from "react";
import { 
  Trash2, Search, Sliders, PlayCircle, Download, FileSpreadsheet, 
  RefreshCw, Terminal, CheckCircle, ShieldAlert, Filter 
} from "lucide-react";
import { ThreatScan } from "../types";

interface Props {
  scans: ThreatScan[];
  onDeleteScan: (id: string) => void;
  onClearAll: () => void;
  onToast: (msg: string, isMalicious: boolean) => void;
}

export default function HistoryLog({ scans, onDeleteScan, onClearAll, onToast }: Props) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");

  const filtered = scans.filter(scan => {
    const matchesSearch = scan.value.toLowerCase().includes(search.toLowerCase()) || 
                          scan.aiExplanation.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || scan.type === filterType;
    const matchesRisk = filterRisk === "all" || scan.riskLevel === filterRisk;
    return matchesSearch && matchesType && matchesRisk;
  });

  const exportToCSV = () => {
    if (filtered.length === 0) {
      onToast("No records found to export.", false);
      return;
    }

    // CSV header row
    const headers = ["Scan ID", "Type", "Resource/Value", "Threat Score", "Risk Level", "AI Report / Explanation", "Timestamp"];
    const rows = filtered.map(s => [
      s.id,
      s.type.toUpperCase(),
      `"${s.value.replace(/"/g, '""')}"`,
      s.threatScore,
      s.riskLevel,
      `"${s.aiExplanation.replace(/"/g, '""')}"`,
      s.timestamp
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cyber_threat_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onToast("Forensic dataset downloaded to CSV successfully!", false);
  };

  return (
    <div id="history-log-module" className="space-y-6 font-mono text-xs">
      
      {/* Upper stats card and interactive filters */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">TACTICAL THREAT REPOSITORY LEDGER</h1>
            <p className="text-[11px] text-zinc-500 font-sans">Query, isolate, filter, or export recorded static scans within security databases.</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              id="export-csv-btn"
              onClick={exportToCSV}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              EXPORT CSV
            </button>
            <button 
              id="clear-all-scans"
              onClick={onClearAll}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 text-red-400 border border-zinc-800 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              WIPE LEDGER
            </button>
          </div>
        </div>

        {/* Dynamic Filters panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-900/35 border border-zinc-805 rounded-xl font-mono">
          
          {/* Keyword search input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input 
              id="history-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by keyword (e.g. PayPal)"
              className="w-full pl-8 pr-2 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono text-zinc-300"
            />
          </div>

          {/* Type filters option */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <select
              id="filter-type-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 p-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-400 focus:outline-none font-mono cursor-pointer"
            >
              <option value="all">TYPE: ALL CHANNELS</option>
              <option value="url">TYPE: URL SCANS</option>
              <option value="ip">TYPE: IP ADDRESSES</option>
              <option value="domain">TYPE: DOMAIN NAMES</option>
              <option value="hash">TYPE: SIGNATURE HASHES</option>
            </select>
          </div>

          {/* Severity filter option */}
          <div className="flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5 text-zinc-500" />
            <select
              id="filter-risk-select"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="flex-1 p-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-400 focus:outline-none font-mono cursor-pointer"
            >
              <option value="all">RISK SEVERITY: ALL</option>
              <option value="Safe">RISK: SAFE ONLY</option>
              <option value="Low">RISK: LOW</option>
              <option value="Medium">RISK: MEDIUM</option>
              <option value="High">RISK: HIGH</option>
              <option value="Critical">RISK: CRITICAL</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Ledger Table view */}
      <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="pb-3 pr-2 font-black">QUERIED RESOURCE</th>
                <th className="pb-3 font-black">SCAN TYPE</th>
                <th className="pb-3 text-center font-black">THREAT SCORE</th>
                <th className="pb-3 font-black">SEVERITY</th>
                <th className="pb-3 font-black">EXPLANATION FORENSICS</th>
                <th className="pb-3 font-black text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((scan) => (
                <tr key={scan.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/20 transition-all" id={`ledger-row-${scan.id}`}>
                  
                  {/* Queried resource */}
                  <td className="py-4 pr-3 text-white font-semibold truncate max-w-[180px]" title={scan.value}>
                    {scan.value}
                  </td>

                  {/* Scan Type badge */}
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] uppercase font-bold text-zinc-500">
                      {scan.type}
                    </span>
                  </td>

                  {/* Threat Score */}
                  <td className="py-4 text-center font-extrabold text-white">
                    {scan.threatScore}
                  </td>

                  {/* Severity level */}
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      scan.riskLevel === "Safe" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" :
                      scan.riskLevel === "Low" ? "bg-blue-950/40 text-blue-400 border border-blue-500/20" :
                      scan.riskLevel === "Medium" ? "bg-amber-950/40 text-amber-400 border border-amber-500/20" :
                      scan.riskLevel === "High" ? "bg-orange-950/40 text-orange-400 border border-orange-500/20" :
                      "bg-red-950/40 text-red-500 border border-red-500/15 animate-pulse"
                    }`}>
                      {scan.riskLevel}
                    </span>
                  </td>

                  {/* Forensic text */}
                  <td className="py-4 text-zinc-400 max-w-[260px] truncate leading-relaxed text-[11px]" title={scan.aiExplanation}>
                    {scan.aiExplanation}
                  </td>

                  {/* Immediate delete button tool */}
                  <td className="py-4 text-center">
                    <button 
                      id={`delete-ledger-entry-${scan.id}`}
                      onClick={() => onDeleteScan(scan.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 bg-zinc-900 hover:bg-red-950/20 rounded border border-zinc-800 hover:border-red-900/30 transition-all cursor-pointer"
                      title="Quarantine & Remove record from ledger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>

                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-505 font-medium">
                     No threat signatures matching active filters. Modify query or initialize a new scan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
