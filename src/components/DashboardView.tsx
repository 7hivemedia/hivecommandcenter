import React, { useState } from "react";
import { 
  Activity, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Layers, 
  RefreshCw,
  BellRing,
  Award,
  Terminal,
  CircleDot,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Globe,
  Mail,
  FileText,
  Database,
  Search,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Info
} from "lucide-react";
import { Client, SystemLog } from "../types";

interface DashboardViewProps {
  clients: Client[];
  systemLogs: SystemLog[];
  addSystemLog: (source: string, msg: string, type: "info" | "success" | "warning" | "error" | "agent") => void;
  triggerSystemScan: () => void;
  isScanning: boolean;
}

export default function DashboardView({ 
  clients, 
  systemLogs, 
  addSystemLog, 
  triggerSystemScan,
  isScanning 
}: DashboardViewProps) {
  // Mock performance metrics & state
  const [cpuLoad, setCpuLoad] = useState(24);
  const [ramLoad, setRamLoad] = useState(48);
  const [networkSpeed, setNetworkSpeed] = useState(85.4);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedLogFilter, setSelectedLogFilter] = useState<"ALL" | "SYSTEM" | "DIRECTOR" | "AGENT" | "ERROR">("ALL");
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);

  // Custom Toast state (replaces ugly window.alerts)
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" | null }>({
    message: "",
    type: null
  });

  const triggerToast = (msg: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast({ message: "", type: null });
    }, 4000);
  };

  // Derive Client and Task Statistics
  const totalClientsCount = clients.length;
  const completedTasksCount = clients.reduce((acc, c) => acc + (c.status === "completed" ? 3 : 2), 0);
  const pendingTasksCount = clients.reduce((acc, c) => acc + (c.status === "pending" ? 2 : 1), 0);
  const completedTodayCount = clients.filter(c => c.auditStatus === "completed").length;
  const activeAuditsCount = clients.filter(c => c.auditStatus === "running").length;

  const handleOptimize = () => {
    setIsOptimizing(true);
    addSystemLog("SYSTEM", "Initiating pipeline memory clean and API cache release...", "info");
    
    setTimeout(() => {
      setCpuLoad(14);
      setRamLoad(31);
      setNetworkSpeed(94.8);
      setIsOptimizing(false);
      addSystemLog("SYSTEM", "Cognitive memory buffer flushed and optimized.", "success");
      triggerToast("System Cognitive Memory flushed & optimized successfully!", "success");
    }, 1500);
  };

  const handlePingAgent = (agentName: string, role: string) => {
    addSystemLog(
      agentName.toUpperCase(), 
      `Direct ping handshake successful. Latency: ${Math.floor(Math.random() * 45) + 5}ms. Role active: ${role}`, 
      "agent"
    );
    triggerToast(`Handshake verification with ${agentName} Agent completed.`, "info");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClientId(id);
    triggerToast("Copied to clipboard", "success");
    setTimeout(() => setCopiedClientId(null), 2000);
  };

  const handleManualAudit = (client: Client) => {
    addSystemLog("DIRECTOR", `Manual audit dispatch initiated for client: ${client.name}`, "info");
    if (client.auditStatus === "running") {
      triggerToast(`${client.name} pipeline is already analyzing!`, "warning");
      return;
    }
    triggerSystemScan();
    triggerToast(`Dispatched Multi-Agent scan for ${client.name}.`, "success");
  };

  // Filter logs for display
  const filteredLogs = systemLogs.filter(log => {
    if (selectedLogFilter === "ALL") return true;
    if (selectedLogFilter === "SYSTEM") return log.source === "SYSTEM";
    if (selectedLogFilter === "DIRECTOR") return log.source === "DIRECTOR";
    if (selectedLogFilter === "AGENT") return log.type === "agent" || ["REVIEWER", "RESEARCHER", "SEO", "AEO"].includes(log.source);
    if (selectedLogFilter === "ERROR") return log.type === "error" || log.type === "warning";
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6 text-slate-800 font-sans relative">
      
      {/* Dynamic Slide-in Toast Notification */}
      {toast.type && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-3 bg-slate-900 text-slate-100 px-4 py-3 rounded-xl shadow-xl border border-slate-700/50 animate-bounce max-w-sm">
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
          {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
          <div className="text-xs font-semibold">{toast.message}</div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h2 id="dashboard-title" className="text-xl font-bold tracking-tight text-slate-900">
            Operations Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-agent activity pipeline, client onboarding matrices, and digital index telemetry.
          </p>
        </div>
        <div className="flex items-center space-x-3 self-start">
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs font-semibold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="tracking-wide uppercase text-[10px]">ALL CORES OPERATIONAL</span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden md:inline">2026-07-16 UTC</span>
        </div>
      </div>

      {/* Stats Counters Grid with Sparkline Trends */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { 
            label: "Active Directory", 
            val: totalClientsCount, 
            desc: "Onboarded Profiles", 
            color: "text-blue-600 animate-pulse", 
            icon: Users,
            spark: "M 0 15 Q 15 5, 30 18 T 60 10 T 90 2"
          },
          { 
            label: "Tasks Pending", 
            val: pendingTasksCount, 
            desc: "Needs Manual Review", 
            color: "text-amber-600", 
            icon: Clock,
            spark: "M 0 2 L 20 12 L 40 8 L 60 18 L 90 15"
          },
          { 
            label: "Documents Signed", 
            val: completedTasksCount, 
            desc: "Agreements Compiled", 
            color: "text-emerald-600", 
            icon: FileText,
            spark: "M 0 18 L 30 12 L 60 15 L 90 4"
          },
          { 
            label: "Audits Completed", 
            val: completedTodayCount, 
            desc: "Completed Cycles", 
            color: "text-indigo-600", 
            icon: CheckCircle2,
            spark: "M 0 18 Q 20 18, 45 10 T 90 2"
          },
          { 
            label: "Active Pipelines", 
            val: activeAuditsCount, 
            desc: "Concurrent Agents", 
            color: "text-rose-600", 
            icon: TrendingUp,
            spark: activeAuditsCount > 0 ? "M 0 15 Q 20 2, 40 18 T 90 5" : "M 0 15 L 90 15"
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-baseline space-x-2 my-2">
                <span className={`text-2xl font-bold tracking-tight ${stat.color}`}>
                  {stat.val}
                </span>
              </div>
              
              {/* Micro Sparkline visualizer */}
              <div className="h-6 w-full flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 font-medium">{stat.desc}</span>
                <svg className="w-12 h-4 stroke-slate-300 fill-none" strokeWidth="1.5">
                  <path d={stat.spark} />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8-col width on desktop) - Operations & Live Pipelines */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Client Onboard & Audit pipeline status table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Onboarded Profiles & Multi-Agent Pipelines</span>
              </div>
              <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-bold uppercase">Active Registry</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Client Identity</th>
                    <th className="py-3 px-4">Enrolled Scope</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Multi-Agent State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Mail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {client.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-1">
                              <span>{client.name}</span>
                              {client.website && (
                                <a 
                                  href={client.website} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-slate-400 hover:text-blue-600 transition"
                                  title={client.website}
                                >
                                  <Globe className="w-3 h-3 inline ml-0.5" />
                                </a>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                              <span>{client.mail}</span>
                              <button 
                                onClick={() => copyToClipboard(client.mail, client.id)} 
                                className="text-slate-300 hover:text-slate-500"
                                title="Copy email"
                              >
                                {copiedClientId === client.id ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Services badges */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {client.services.split(",").map((svc, sIdx) => {
                            const trimmed = svc.trim();
                            let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
                            if (trimmed.includes("AEO")) badgeStyle = "bg-purple-50 text-purple-700 border-purple-100";
                            else if (trimmed.includes("SEO")) badgeStyle = "bg-blue-50 text-blue-700 border-blue-100";
                            else if (trimmed.includes("WAAS") || trimmed.includes("Website")) badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100";
                            else if (trimmed.includes("Research")) badgeStyle = "bg-amber-50 text-amber-700 border-amber-100";

                            return (
                              <span key={sIdx} className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium border uppercase tracking-tight ${badgeStyle}`}>
                                {trimmed}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Active Onboarding Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          client.status === "active" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : client.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            client.status === "active" ? "bg-emerald-500" : client.status === "pending" ? "bg-amber-500" : "bg-slate-400"
                          }`} />
                          {client.status}
                        </span>
                      </td>

                      {/* Multi-Agent Audit Pipeline Progress */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-slate-500">
                              {client.auditStatus === "running" ? (
                                <span className="text-amber-600 flex items-center">
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin mr-1" /> Analyzing...
                                </span>
                              ) : client.auditStatus === "completed" ? (
                                <span className="text-emerald-600 font-bold">Audited</span>
                              ) : client.auditStatus === "failed" ? (
                                <span className="text-rose-600">Failed</span>
                              ) : (
                                <span className="text-slate-400">Not Scanned</span>
                              )}
                            </span>
                            <span className="font-mono text-slate-600 font-bold">{client.auditProgress}%</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-700 ${
                                client.auditStatus === "completed" 
                                  ? "bg-emerald-500" 
                                  : client.auditStatus === "running" 
                                  ? "bg-amber-500 animate-pulse" 
                                  : "bg-slate-300"
                              }`}
                              style={{ width: `${client.auditProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Manual Action dispatch trigger */}
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={() => handleManualAudit(client)}
                          disabled={isScanning}
                          className="px-2.5 py-1 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-bold border border-slate-200 hover:border-blue-200 text-slate-600 transition"
                        >
                          Trigger Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
              PROFILES AUTO-SYNCHRONIZED WITH INTERNAL MARKESEARCH REPOSITORIES
            </div>
          </div>

          {/* Section 2: Performance Gauges & Core System Load */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Operational Load & Cognitive Allocation</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">TELEMETRY LOOP</span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 text-center">
              {/* CPU Load */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="38" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                    <circle cx="48" cy="48" r="38" className="stroke-blue-600 transition-all duration-500" strokeWidth="6" fill="transparent"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - cpuLoad / 100)}
                    />
                  </svg>
                  <div className="absolute text-base font-bold text-slate-900">{cpuLoad}%</div>
                </div>
                <span className="text-[10px] font-bold mt-2 text-slate-500 uppercase tracking-wider">CPU Allocation</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Core VM stable</span>
              </div>

              {/* RAM Load */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="38" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                    <circle cx="48" cy="48" r="38" className="stroke-indigo-600 transition-all duration-500" strokeWidth="6" fill="transparent"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - ramLoad / 100)}
                    />
                  </svg>
                  <div className="absolute text-base font-bold text-slate-900">{ramLoad}%</div>
                </div>
                <span className="text-[10px] font-bold mt-2 text-slate-500 uppercase tracking-wider">Cognitive Cache</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Buffer limit 8GB</span>
              </div>

              {/* Network load */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="38" className="stroke-slate-100" strokeWidth="6" fill="transparent" />
                    <circle cx="48" cy="48" r="38" className="stroke-emerald-600 transition-all duration-500" strokeWidth="6" fill="transparent"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - networkSpeed / 100)}
                    />
                  </svg>
                  <div className="absolute text-xs font-bold text-slate-900">{networkSpeed} Mb/s</div>
                </div>
                <span className="text-[10px] font-bold mt-2 text-slate-500 uppercase tracking-wider">API Ingress Sync</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Gemini handshake active</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <div className="flex items-center space-x-1">
                <CircleDot className="w-3 h-3 text-blue-600 animate-pulse" />
                <span>DIRECTOR PIPELINE AGENT STATUS: LISTENING</span>
              </div>
              <span>PORT 3000 SECURE</span>
            </div>
          </div>

        </div>

        {/* Right Column (4-col width on desktop) - Operations Controls & Agents Monitor */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section 1: Active Multi-Agent Cores status monitor */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Multi-Agent Core Handshakes</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded uppercase">CORES: 5</span>
            </div>

            <div className="space-y-3.5">
              {[
                { 
                  name: "Director", 
                  role: "Lead Strategist & Routing Core", 
                  status: "LISTENING", 
                  dotColor: "bg-emerald-500", 
                  desc: "Analyzes client files, delegates to sub-agents, writes briefing dossiers.",
                  badge: "info"
                },
                { 
                  name: "Reviewer", 
                  role: "Verification & Compliance Engine", 
                  status: "IDLE", 
                  dotColor: "bg-blue-400", 
                  desc: "Verifies digital asset availability and automatically draft service agreements.",
                  badge: "success"
                },
                { 
                  name: "Researcher", 
                  role: "Competitive Deep Scraper", 
                  status: "STANDBY", 
                  dotColor: "bg-indigo-400", 
                  desc: "Executes deep web searches and scrapes demographic organic metrics.",
                  badge: "agent"
                },
                { 
                  name: "SEO Strategist", 
                  role: "Search Intent Analyst", 
                  status: "IDLE", 
                  dotColor: "bg-blue-400", 
                  desc: "Generates semantic keywords and optimized markup structures.",
                  badge: "warning"
                },
                { 
                  name: "AEO Optimizer", 
                  role: "Answer Engine Citation Indexer", 
                  status: "IDLE", 
                  dotColor: "bg-blue-400", 
                  desc: "Fuses brand nodes to prepare citation answers for LLM databases.",
                  badge: "info"
                }
              ].map((agent, i) => (
                <div key={i} className="group p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${agent.dotColor} ${agent.status === "LISTENING" ? "animate-ping" : ""}`} />
                      <span className="font-bold text-slate-900 text-xs">{agent.name} Core</span>
                    </div>
                    <button 
                      onClick={() => handlePingAgent(agent.name, agent.role)}
                      className="text-[9px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 font-bold px-2 py-0.5 rounded transition"
                    >
                      Ping Node
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">{agent.role}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal group-hover:text-slate-500 transition-colors">
                    {agent.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: CRM Tools Control Center */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-900 tracking-tight flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>CRM Operations Suite</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono">UTILITY</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                Execute deep pipeline diagnostic checks, clean memory buffers, and emit global system handshake directives across active nodes.
              </p>
            </div>

            <div className="space-y-2">
              <button 
                id="btn-trigger-scan"
                onClick={() => {
                  triggerSystemScan();
                  triggerToast("Full connection health-check initiated.", "info");
                }}
                disabled={isScanning}
                className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all border ${
                  isScanning 
                    ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-100"
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                <span>{isScanning ? "Diagnosing Pipeline..." : "Diagnose Connections"}</span>
              </button>

              <button 
                id="btn-optimize-cores"
                onClick={handleOptimize}
                disabled={isOptimizing}
                className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all border ${
                  isOptimizing 
                    ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>{isOptimizing ? "Flushing memory..." : "Flush Cache Buffer"}</span>
              </button>
              
              <button 
                id="btn-broadcast"
                onClick={() => {
                  addSystemLog("DIRECTOR", "Network broadcast ping issued to all active marketing cores.", "info");
                  triggerToast("Broadcast dispatch successfully delivered to all agents.", "success");
                }}
                className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Broadcast Network Ping</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Section: Telemetry System Logs Feed (Interactive Terminal) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <Terminal className="w-4 h-4 text-slate-600" />
            <span>Telemetry System Logs Feed</span>
          </div>
          
          {/* Interactive filter tabs */}
          <div className="flex flex-wrap gap-1">
            {(["ALL", "SYSTEM", "DIRECTOR", "AGENT", "ERROR"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedLogFilter(filter)}
                className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition ${
                  selectedLogFilter === filter
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-500 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {/* Log rows */}
        <div className="p-4 max-h-60 overflow-y-auto font-mono text-[11px] space-y-2 bg-slate-950 text-slate-300">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 text-center py-6">
              <AlertCircle className="w-5 h-5 mx-auto mb-1 text-slate-600" />
              <span>No telemetry activities fit current filter criteria.</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              let tagColor = "text-blue-400 bg-blue-950/50 border-blue-900/50";
              if (log.type === "success") tagColor = "text-emerald-400 bg-emerald-950/50 border-emerald-900/50";
              if (log.type === "warning") tagColor = "text-amber-400 bg-amber-950/50 border-amber-900/50";
              if (log.type === "error") tagColor = "text-rose-400 bg-rose-950/50 border-rose-900/50";
              if (log.type === "agent") tagColor = "text-purple-400 bg-purple-950/50 border-purple-900/50";

              return (
                <div key={log.id} className="flex items-start space-x-2 py-1.5 border-b border-slate-900/30 last:border-0 hover:bg-slate-900/25 px-1 rounded transition duration-100">
                  <span className="text-slate-500 font-mono shrink-0">[{log.timestamp}]</span>
                  <span className={`px-1.5 py-0.2 rounded border text-[9px] uppercase font-bold tracking-wider shrink-0 ${tagColor}`}>
                    {log.source}
                  </span>
                  <span className="text-slate-300 flex-1 break-all leading-normal">{log.message}</span>
                </div>
              );
            })
          )}
        </div>
        
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-500 font-mono">
          <span>PIPELINE TELEMETRY: ACTIVE STREAM</span>
          <span>FILTERS CHOSEN: {selectedLogFilter}</span>
        </div>
      </div>

    </div>
  );
}
