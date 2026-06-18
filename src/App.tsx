import React, { useState, useEffect } from "react";
import { 
  Shield, Activity, Bot, BookOpen, Key, Users, History, Cpu, Globe,
  Terminal, ShieldCheck, HelpCircle, HardDrive, BellRing, Settings, 
  Menu, X, Lock, LogOut, Sun, Moon, LogIn, ChevronRight
} from "lucide-react";

import { ThreatScan, SystemUser } from "./types";
import CyberDashboard from "./components/CyberDashboard";
import UrlAnalyzer from "./components/UrlAnalyzer";
import IpIntelligence from "./components/IpIntelligence";
import DomainIntelligence from "./components/DomainIntelligence";
import FileHashAnalyzer from "./components/FileHashAnalyzer";
import RealTimeFeed from "./components/RealTimeFeed";
import AiAssistant from "./components/AiAssistant";
import HistoryLog from "./components/HistoryLog";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scans, setScans] = useState<ThreatScan[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Authentication states
  const [user, setUser] = useState<{ name: string; email: string; role: string; image: string } | null>({
    name: "Cyber Ops Lead",
    email: "jinitelangbam8@gmail.com",
    role: "Administrator",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");

  // Edit current personal profile states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileName, setEditProfileName] = useState("");
  const [editProfileEmail, setEditProfileEmail] = useState("");
  const [editProfileRole, setEditProfileRole] = useState("Administrator");
  const [editProfileImage, setEditProfileImage] = useState("");

  // Toast notification state
  const [toasts, setToasts] = useState<{ id: string; msg: string; isMalicious: boolean }[]>([]);

  const triggerToast = (msg: string, isMalicious: boolean) => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, msg, isMalicious }]);
    
    // Automatically fade out toast notifications
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setScans(data);
      }
    } catch (err) {
      console.error("Failed to compile historical threat data.");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAddScan = (newScan: ThreatScan) => {
    setScans(prev => [newScan, ...prev]);
  };

  const handleDeleteScan = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setScans(prev => prev.filter(s => s.id !== id));
        triggerToast("Vulnerability record removed safely from ledger.", false);
      }
    } catch (err) {
      console.error("Failed to delete ledger scan entry.");
    }
  };

  const handleClearAllHistory = async () => {
    try {
      const res = await fetch("/api/history-clear", {
        method: "DELETE"
      });
      if (res.ok) {
        setScans([]);
        triggerToast("Threat telemetry ledger wiped cleanly.", false);
      }
    } catch (err) {
      console.error("Failed to wipe threat logs repository.");
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setUser({
      name: loginEmail.split("@")[0].toUpperCase() + " OPS",
      email: loginEmail,
      role: loginEmail.includes("admin") ? "Administrator" : "User",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
    });
    setShowAuthModal(false);
    triggerToast(`Authenticated successfully as ${loginEmail}`, false);
  };

  const handleLogout = () => {
    setUser(null);
    triggerToast("Logged out from security operations center console.", false);
    setActiveTab("dashboard");
  };

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfileName.trim() || !editProfileEmail.trim()) {
      triggerToast("Name and Email parameters are required to commit credentials.", true);
      return;
    }
    setUser({
      name: editProfileName.trim(),
      email: editProfileEmail.trim(),
      role: editProfileRole,
      image: editProfileImage.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    });
    setShowEditProfileModal(false);
    triggerToast("Active session security profile identity parameters updated successfully.", false);
  };

  // Nav mapping
  const menuItems = [
    { id: "dashboard", label: "Operations Command", icon: Activity, adminOnly: false },
    { id: "url", label: "URL Threat Analyzer", icon: Globe, adminOnly: false },
    { id: "ip", label: "IP Intelligence Node", icon: Shield, adminOnly: false },
    { id: "domain", label: "Domain DNS WHOIS", icon: Key, adminOnly: false },
    { id: "hash", label: "Malware Hash Audits", icon: Cpu, adminOnly: false },
    { id: "threat-feed", label: "Global Threat Stream", icon: BellRing, adminOnly: false },
    { id: "assistant", label: "AI Security Co-Pilot", icon: Bot, adminOnly: false },
    { id: "history", label: "Logs Repository ledger", icon: History, adminOnly: false },
    { id: "admin", label: "SOC Master Admin", icon: Users, adminOnly: true }
  ];

  return (
    <div id="main-ops-root" className={`min-h-screen ${isDarkMode ? "bg-[#020617] text-slate-200" : "bg-slate-50 text-slate-900"} flex flex-col font-sans transition-all duration-300`}>
      
      {/* Toast Alert stack banner */}
      <div id="toast-banner-container" className="fixed top-4 right-4 z-50 pointer-events-none space-y-2.5 max-w-sm w-full">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-3.5 rounded-xl border backdrop-blur-md pointer-events-auto flex gap-3 text-xs font-mono shadow-xl animate-bounce ${
              t.isMalicious 
                ? "bg-red-950/85 text-red-200 border-red-500/30 shadow-red-500/5" 
                : "bg-slate-900/85 text-slate-200 border-slate-800/50 shadow-blue-500/5"
            }`}
          >
            <BellRing className={`h-4.5 w-4.5 shrink-0 ${t.isMalicious ? "text-red-400 animate-pulse" : "text-emerald-400"}`} />
            <div>
              <p className="font-semibold uppercase tracking-wider">{t.isMalicious ? "⚠ HIGH RISK EXPLOIT FLAG!" : "✓ CRITICAL STATUS LOG"}</p>
              <p className="mt-0.5 opacity-90 leading-relaxed font-sans">{t.msg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar Drawer */}
        <aside id="sidebar-drawer" className={`w-full md:w-64 border-b md:border-b-0 md:border-r backdrop-blur-xl ${isDarkMode ? "bg-slate-950/40 border-slate-800/50" : "bg-white/60 border-slate-200/80"} flex flex-col justify-between shrink-0`}>
          
          <div className="p-4">
            {/* Command identifier header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/30">
              <div className="flex items-center gap-2">
                <Shield className="h-5.5 w-5.5 text-blue-400 animate-cyber-pulse shrink-0" />
                <span className="font-bold tracking-wider font-mono text-sm inline-block text-white uppercase">CYBER<span className="text-blue-400">INTEL</span></span>
              </div>
              <button 
                id="toggle-mobile-sidebar"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="md:hidden p-1 rounded hover:bg-slate-800/40"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            {/* Menu Links */}
            <nav id="nav-group-side" className={`mt-4 ${mobileMenuOpen ? "block" : "hidden md:block"} space-y-1`}>
              <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Intelligence System</div>
              {menuItems.map(item => {
                // If user is not admin, hide administrative logs paths
                if (item.adminOnly && user?.role !== "Administrator") return null;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-link-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-md text-xs font-mono font-medium tracking-wide text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === item.id 
                        ? `${isDarkMode ? "bg-blue-600/10 border-l-2 border-blue-500 text-blue-400" : "bg-blue-50 border-l-2 border-blue-600 text-blue-800 font-bold"}` 
                        : `${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800/30" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight className="h-3.5 w-3.5 text-blue-400" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User profile segment bottom */}
          <div id="sidebar-user-section" className={`p-4 border-t ${isDarkMode ? "border-slate-800/50" : "border-slate-200"} ${mobileMenuOpen ? "block" : "hidden md:block"}`}>
            {user ? (
              <div className="flex items-center justify-between gap-3 font-mono text-xs">
                <button 
                  id="user-profile-edit-trigger"
                  onClick={() => {
                    setEditProfileName(user.name);
                    setEditProfileEmail(user.email);
                    setEditProfileRole(user.role);
                    setEditProfileImage(user.image);
                    setShowEditProfileModal(true);
                  }}
                  className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-90 transition-all cursor-pointer group flex-1"
                  title="Click to edit security profile parameters"
                >
                  <div className="relative shrink-0">
                    <img src={user.image} alt={user.name} className="h-8.5 w-8.5 rounded-full border border-slate-700 bg-slate-800 bg-cover group-hover:border-blue-500 transition-all" />
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Settings className="h-3 w-3 text-white animate-spin" />
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <span className="block font-bold text-white truncate group-hover:text-blue-400 transition-all" title={user.name}>{user.name}</span>
                    <span className="block text-[9px] text-blue-400 uppercase font-bold tracking-wider" title={user.email}>{user.role}</span>
                  </div>
                </button>
                <button 
                  id="user-logout-btn"
                  onClick={handleLogout}
                  className="p-1 px-1.5 bg-slate-900/60 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-800 rounded cursor-pointer transition-all shrink-0"
                  title="Sign out from security center"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                id="user-trigger-login"
                onClick={() => {
                  setLoginEmail("");
                  setShowAuthModal(true);
                }}
                className="w-full py-2.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-mono border border-blue-500/20 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogIn className="h-4 w-4 text-blue-400 animate-pulse" />
                AUTHENTICATE
              </button>
            )}
          </div>

        </aside>

        {/* Content Operations Panel Container */}
        <main id="operations-panels-deck" className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
          
          {/* Main Top Header Block */}
          <header className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b ${isDarkMode ? "border-slate-800/50 bg-slate-900/20 backdrop-blur-md" : "border-slate-200/50 bg-white/40 backdrop-blur-md"} rounded-2xl`}>
            <div>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest block font-bold">STATE SECURITY PLATFORM</span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-sans mt-0.5 flex items-center gap-2.5">
                {menuItems.find(i => i.id === activeTab)?.label}
                <span className="text-[10px] font-mono tracking-normal bg-slate-900/40 border border-slate-800/50 rounded-full text-slate-300 font-medium px-2 py-0.5">
                  V.12 ACTIVE
                </span>
              </h2>
            </div>

            {/* Quick theme togglers */}
            <div className="flex items-center gap-3">
              <button 
                id="theme-switch-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2 border border-slate-800/50 rounded-lg hover:bg-slate-800/40 text-slate-400 hover:text-slate-100 transition-all cursor-pointer bg-slate-900/20 backdrop-blur-sm"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
              </button>
              <div className="text-[11px] font-mono select-none px-3 py-1.5 border border-slate-800/50 bg-slate-900/40 text-slate-300 rounded-md backdrop-blur-sm">
                UTC: {new Date().toISOString().replace("T", " ").substring(0, 19)}
              </div>
            </div>
          </header>

          {/* Module Loader mapping */}
          <div id="active-routing-stage">
            {activeTab === "dashboard" && (
              <CyberDashboard scans={scans} onNavigate={setActiveTab} />
            )}
            {activeTab === "url" && (
              <UrlAnalyzer scans={scans} onDeleteScan={handleDeleteScan} onAddScan={handleAddScan} onToast={triggerToast} />
            )}
            {activeTab === "ip" && (
              <IpIntelligence onAddScan={handleAddScan} onToast={triggerToast} />
            )}
            {activeTab === "domain" && (
              <DomainIntelligence onAddScan={handleAddScan} onToast={triggerToast} />
            )}
            {activeTab === "hash" && (
              <FileHashAnalyzer onAddScan={handleAddScan} onToast={triggerToast} />
            )}
            {activeTab === "threat-feed" && (
              <RealTimeFeed />
            )}
            {activeTab === "assistant" && (
              <AiAssistant />
            )}
            {activeTab === "history" && (
              <HistoryLog scans={scans} onDeleteScan={handleDeleteScan} onClearAll={handleClearAllHistory} onToast={triggerToast} />
            )}
            {activeTab === "admin" && user?.role === "Administrator" && (
              <AdminPanel />
            )}
          </div>

        </main>

      </div>

      {/* Authentication Simulation popover */}
      {showAuthModal && (
        <div id="authenticator-popover" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 max-w-sm w-full font-mono text-xs text-zinc-300 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                SECURITY REGISTER SIGNIN
              </span>
              <button 
                id="close-auth-popover"
                onClick={() => setShowAuthModal(false)}
                className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[10px] text-zinc-400 leading-normal font-sans">
              Enter email address. Submitting addresses containing <strong>'admin'</strong> initializes console panel credentials with full administrative access scopes.
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-500 font-bold mb-1.5 uppercase">Authentication Email</label>
                <input 
                  id="auth-email-input"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g., admin@security.agency"
                  className="w-full p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-650"
                  required
                />
              </div>

              <button 
                id="auth-submit-btn"
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-bold text-zinc-950 transition-all font-mono tracking-widest cursor-pointer"
              >
                AUTHENTICATE SIGNIN
              </button>
            </form>

            <div className="pt-3 border-t border-zinc-900 flex justify-between gap-2 text-[9px] text-zinc-600 font-semibold font-sans">
              <span>SUPPORT INTEGRATES GOOGLE / GITHUB SECURE AUTH METRICS</span>
            </div>

          </div>
        </div>
      )}

      {/* Edit Profile Modal Dialog */}
      {showEditProfileModal && (
        <div id="profile-editor-popover" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 max-w-sm w-full font-mono text-xs text-slate-300 space-y-4 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-400 animate-spin" />
                MODIFY PROFILE IDENTITY
              </span>
              <button 
                id="close-profile-popover"
                onClick={() => setShowEditProfileModal(false)}
                className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal font-sans">
              Modify current active session clearance and operator callsign. Commit updates directly to update local token payloads.
            </p>

            <form onSubmit={handleEditProfileSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Operator Callsign / Name</label>
                <input 
                  id="profile-name-input"
                  type="text"
                  value={editProfileName}
                  onChange={(e) => setEditProfileName(e.target.value)}
                  placeholder="e.g., Lead Security Architect"
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-slate-200 outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Security Email</label>
                <input 
                  id="profile-email-input"
                  type="email"
                  value={editProfileEmail}
                  onChange={(e) => setEditProfileEmail(e.target.value)}
                  placeholder="e.g., lead@cyber.org"
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-slate-200 outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Clearance Role</label>
                <select 
                  id="profile-role-select"
                  value={editProfileRole}
                  onChange={(e) => setEditProfileRole(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-mono text-slate-200 outline-none focus:border-blue-500/50 cursor-pointer"
                >
                  <option value="Administrator">Administrator (SOC Master Clearance)</option>
                  <option value="User">User (Operations / Standard Access)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Avatar Image URL</label>
                <input 
                  id="profile-image-input"
                  type="text"
                  value={editProfileImage}
                  onChange={(e) => setEditProfileImage(e.target.value)}
                  placeholder="Paste profile photo image URL..."
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-[11px] font-mono text-slate-200 outline-none focus:border-blue-500/50"
                />
              </div>

              <button 
                id="profile-save-submit-btn"
                type="submit"
                className="w-full py-2.5 mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all font-mono tracking-wider cursor-pointer"
              >
                SAVE PROFILE UPDATES
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
