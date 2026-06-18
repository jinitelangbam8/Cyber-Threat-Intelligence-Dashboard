import React, { useState, useEffect } from "react";
import { 
  Users, Key, Settings, Cpu, Database, Activity, RefreshCw, 
  Terminal, ShieldCheck, HelpCircle, HardDrive, ToggleLeft,
  UserPlus, Edit, Trash2, Save, X, ShieldAlert, Image
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

  // State for adding a new user
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User",
    image: ""
  });

  // State for editing user
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "User",
    image: ""
  });

  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  useEffect(() => {
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!newUser.name.trim() || !newUser.email.trim()) {
      setFormError("Name and Email parameters are required to provision console credentials.");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          image: newUser.image || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=200`
        })
      });

      if (res.ok) {
        const created = await res.json();
        setUsers(prev => [...prev, created]);
        setNewUser({ name: "", email: "", role: "User", image: "" });
        setShowAddForm(false);
        setSuccessMsg("System credentials provisioned and committed to security database.");
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to compile security credentials.");
      }
    } catch (err) {
      setFormError("Network timeout or connection refused while provisioning.");
    }
  };

  const handleStartEdit = (user: SystemUser) => {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image
    });
    setFormError("");
  };

  const handleSaveEdit = async (id: string) => {
    setFormError("");
    setSuccessMsg("");

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setFormError("Name and Email credentials cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.id === id ? updated : u));
        setEditingUserId(null);
        setSuccessMsg("Identity parameters updated and saved.");
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Could not update node permissions.");
      }
    } catch (err) {
      setFormError("Communication failure during secure commit.");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to revoke administrative permissions for ${name}? This acts irreversibly.`)) {
      return;
    }

    setFormError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        setSuccessMsg("Security profile purged successfully.");
      } else {
        setFormError("Failed to revoke session permissions from central core.");
      }
    } catch (err) {
      setFormError("Communication failure during authorization revoke process.");
    }
  };

  return (
    <div id="admin-operations-module" className="space-y-6 font-mono text-xs">
      
      {/* Upper overview statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-4 rounded-xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex items-center justify-between shadow-xl">
          <div>
            <span className="text-slate-500 font-bold block uppercase tracking-widest text-[9px]">Active System Nodes</span>
            <span className="text-xl font-bold font-mono tracking-tight text-white mt-1 block">8 / 8 Active</span>
          </div>
          <Activity className="h-7 w-7 text-emerald-400 animate-cyber-pulse" />
        </div>

        <div className="p-4 rounded-xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex items-center justify-between shadow-xl">
          <div>
            <span className="text-slate-500 font-bold block uppercase tracking-widest text-[9px]">Telemetry API Latency</span>
            <span className="text-xl font-bold font-mono tracking-tight text-white mt-1 block">43 ms Avg</span>
          </div>
          <Cpu className="h-7 w-7 text-indigo-400" />
        </div>

        <div className="p-4 rounded-xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex items-center justify-between shadow-xl">
          <div>
            <span className="text-slate-500 font-bold block uppercase tracking-widest text-[9px]">Active DB Records</span>
            <span className="text-xl font-bold font-mono tracking-tight text-white mt-1 block">Compacted JSON</span>
          </div>
          <Database className="h-7 w-7 text-slate-400" />
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Administrative settings form (2 cols wide) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-md space-y-5 shadow-xl">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-850">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-white">Security Controls & Authorization</h2>
            <div className="text-[10px] text-slate-400 font-semibold">SOC LEVEL 3 SECURITY MODE</div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-500 font-semibold uppercase font-mono">RATE LIMIT COOLDOWN</span>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-slate-300 font-bold font-mono shrink-0 w-12 text-right">{rateLimit} RPS</span>
              </div>
              <p className="text-[10px] text-slate-500">Limits dynamic endpoint analyses queries per user IP segment.</p>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-500 font-semibold uppercase font-mono">AI INTELLIGENCE ENGINE MODEL</span>
              <select
                value={aiEngine}
                onChange={(e) => setAiEngine(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 text-xs rounded-lg text-slate-300 font-mono transition-all outline-none cursor-pointer focus:border-blue-500/50"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Operational)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Analyst Mode)</option>
                <option value="rules-local">Heuristic Parsing Patterns (Offline Fallback)</option>
              </select>
              <p className="text-[10px] text-slate-500">Target model selected for generative security forensics checks.</p>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-white font-bold uppercase block tracking-wider">Access Control Matrix</span>
                <span className="text-[10px] text-slate-500">Edit, register and revoke operator authorization profiles.</span>
              </div>
              <button
                id="btn-trigger-add-user"
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setFormError("");
                  setSuccessMsg("");
                }}
                className="p-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/10"
              >
                {showAddForm ? <X className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                <span>{showAddForm ? "CLOSE SECURE FORM" : "PROVISION NEW ACCESS"}</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-950/30 text-red-200">
                ⚠ COMPROMISE PREVENTED: {formError}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/30 text-emerald-300">
                ✓ SECURE COMMIT VERIFIED: {successMsg}
              </div>
            )}

            {/* Add User Secure Form */}
            {showAddForm && (
              <form onSubmit={handleAddUser} className="mb-6 p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3.5 animate-fadeIn">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">PROVISION CREDENTIALS SCHEME</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">NAME / CALLSIGN</label>
                    <input
                      id="input-add-user-name"
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., SOC Incident Handler"
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-blue-500/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">SECURE SMTP EMAIL</label>
                    <input
                      id="input-add-user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g., analyst.delta@ops.ca"
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-blue-500/50 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">ROLE CLEARANCE LEVEL</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-blue-500/50 outline-none cursor-pointer"
                    >
                      <option value="User">User (Read-Only Scan Tools)</option>
                      <option value="Administrator">Administrator (Commit and Ledger Purges)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">IMAGE MATCH AVATAR (URL - OPTIONAL)</label>
                    <input
                      id="input-add-user-image"
                      type="text"
                      value={newUser.image}
                      onChange={(e) => setNewUser(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg (leave blank for random)"
                      className="w-full p-2 bg-slate-900 border border-slate-800 text-[11px] rounded-lg text-slate-200 focus:border-blue-500/50 outline-none"
                    />
                  </div>
                </div>

                <button
                  id="btn-add-user-submit"
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono tracking-wider cursor-pointer shadow-md shadow-blue-500/10"
                >
                  COMMIT SECURE PROFILE TO LDAP
                </button>
              </form>
            )}

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4 text-slate-500">Querying LDAP directory records...</div>
              ) : (
                users.map(u => {
                  const isEditing = editingUserId === u.id;
                  return (
                    <div 
                      key={u.id} 
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono shadow-md ${
                        isEditing 
                          ? "bg-slate-950 border-blue-500/40" 
                          : "bg-slate-950/60 border-slate-800/60 hover:bg-slate-900/30"
                      }`}
                    >
                      {/* Read Mode vs Edit Mode */}
                      {isEditing ? (
                        <div className="flex-1 space-y-3">
                          <div className="text-[10px] font-bold text-gray-400 uppercase">MODIFY SECURITY RECORD</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-500 font-bold text-[9px] mb-0.5">NAME</label>
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-500 font-bold text-[9px] mb-0.5">EMAIL</label>
                              <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-500 font-bold text-[9px] mb-0.5">ROLE</label>
                              <select
                                value={editForm.role}
                                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white cursor-pointer"
                              >
                                <option value="User">User</option>
                                <option value="Administrator">Administrator</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-500 font-bold text-[9px] mb-0.5">AVATAR URL</label>
                              <input
                                type="text"
                                value={editForm.image}
                                onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                                className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-white"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className="px-2.5 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded cursor-pointer"
                            >
                              CANCEL
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(u.id)}
                              className="px-2.5 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="h-3 w-3" />
                              SAVE CHANGES
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <img src={u.image} alt={u.name} className="h-9 w-9 rounded-full border border-slate-700 bg-slate-900" />
                            <div>
                              <span className="text-slate-200 font-bold block text-xs">{u.name}</span>
                              <span className="text-[10px] text-slate-500 block leading-normal">{u.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border shrink-0 ${
                              u.role === "Administrator" ? "bg-indigo-950/40 text-indigo-400 border-indigo-500/20" : "bg-slate-900 text-slate-400 border-slate-850"
                            }`}>
                              {u.role}
                            </span>
                            
                            {/* Edit Action */}
                            <button
                              onClick={() => handleStartEdit(u)}
                              className="p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-all"
                              title="Modify Profile identity parameters"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete Action */}
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-lg text-slate-500 hover:text-red-400 cursor-pointer transition-all"
                              title="Purge / Revoke credentials"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Console System Syslog logs (1 column) */}
        <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/50 backdrop-blur-md flex flex-col justify-between h-[420px] shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-rose-450 font-bold mb-3 uppercase font-mono">
              <Terminal className="h-4 w-4 text-blue-500 animate-pulse" />
              <span className="text-white">LOGGER SUBSYSTEM (SYSLOG)</span>
            </div>
            
            <div className="space-y-2.5 h-[270px] overflow-y-auto no-scrollbar font-mono text-[9px] text-slate-400 leading-normal">
              {activeConsoleLogs.map((log, i) => (
                <div key={i} className="py-1 border-b border-slate-800/40 truncate">
                  <span className="text-blue-500 font-semibold">{`>`}</span> {log}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] text-slate-500 font-semibold uppercase text-center mt-3 border-t border-slate-800/40 pt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Telemetry streams compliant, security audits stable.</span>
          </p>
        </div>

      </div>

    </div>
  );
}
