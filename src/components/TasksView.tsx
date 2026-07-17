import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Search, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  User, 
  ListTodo, 
  Info, 
  Activity, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldCheck
} from "lucide-react";
import { Client, AgentTask } from "../types";

interface TasksViewProps {
  clients: Client[];
  tasks: AgentTask[];
  setTasks: React.Dispatch<React.SetStateAction<AgentTask[]>>;
  addSystemLog: (source: string, msg: string, type: "info" | "success" | "warning" | "error" | "agent") => void;
}

// Map roles to exact human identities matching existing codebase description
const AGENT_PROFILES = [
  {
    role: "Director",
    name: "Aiden Cross",
    description: "Central dispatcher managing operations, dossiers, and legal structures.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    color: "blue"
  },
  {
    role: "Reviewer",
    name: "Serena Chen",
    description: "Evaluates outputs for brand coherence, accuracy, and corporate compliance.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80",
    color: "amber"
  },
  {
    role: "Researcher",
    name: "Marcus Vance",
    description: "Scrapes digital databases and models target market demographic hooks.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80",
    color: "purple"
  },
  {
    role: "SEO",
    name: "Sophia Patel",
    description: "Maps schema markups, site hierarchy, sitemaps, and indexing models.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
    color: "emerald"
  },
  {
    role: "AEO",
    name: "Kai Takahashi",
    description: "Optimizes citations across LLM database graphs (Gemini, Claude, ChatGPT).",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    color: "indigo"
  }
];

// Sub-step descriptors for realistic live execution simulation
const getAgentSubSteps = (role: string, progress: number): string => {
  if (progress === 100) {
    if (role === "Director") return "Draft compilation finalized. System logs registered.";
    if (role === "Reviewer") return "Review verification complete. Feedback saved.";
    if (role === "Researcher") return "Research database updated with high-value assets.";
    if (role === "SEO") return "Organic SEO roadmap written and compiled.";
    return "Answer Engine Optimization audit complete.";
  }
  
  if (role === "Director") {
    if (progress < 25) return "Initializing core dispatcher handshakes...";
    if (progress < 55) return "Analyzing client contract structure & alignment...";
    if (progress < 85) return "Compiling semantic draft schemas...";
    return "Verifying compliance with corporate mandates...";
  } else if (role === "Reviewer") {
    if (progress < 25) return "Parsing active outputs from researchers...";
    if (progress < 55) return "Checking grammar alignment and branding constraints...";
    if (progress < 85) return "Resolving credential disputes and encryption protocols...";
    return "Writing final reviewer feedback...";
  } else if (role === "Researcher") {
    if (progress < 25) return "Querying digital indices for market data...";
    if (progress < 55) return "Scraping target websites and analyzing competitor traffic...";
    if (progress < 85) return "Extracting dynamic content angles and keyword targets...";
    return "Generating viral persona hooks...";
  } else if (role === "SEO") {
    if (progress < 25) return "Analyzing metadata density and mobile responsiveness...";
    if (progress < 55) return "Structuring on-page hierarchy (H1-H3 headers)...";
    if (progress < 85) return "Creating automated XML sitemaps and JSON-LD schema markup...";
    return "Evaluating organic search ranking probabilities...";
  } else {
    if (progress < 25) return "Mapping conversational search queries across AI frameworks...";
    if (progress < 55) return "Analyzing citation densities on Claude, ChatGPT, and Gemini...";
    if (progress < 85) return "Structuring question-answer answer engine matches...";
    return "Evaluating Knowledge Graph schema integrity...";
  }
};

export default function TasksView({ clients, tasks, setTasks, addSystemLog }: TasksViewProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "running" | "completed" | "failed">("all");
  
  // Custom Task Builder state
  const [isCreating, setIsCreating] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customClientName, setCustomClientName] = useState("");
  const [customRole, setCustomRole] = useState<"Director" | "Reviewer" | "Researcher" | "SEO" | "AEO">("Researcher");
  const [customDescription, setCustomDescription] = useState("");
  const [simSpeed, setSimSpeed] = useState<"fast" | "medium" | "slow">("medium");

  // Keep customClientName synchronized with the available clients
  useEffect(() => {
    if (clients.length > 0) {
      if (!customClientName || !clients.some(c => c.name === customClientName)) {
        setCustomClientName(clients[0].name);
      }
    } else {
      setCustomClientName("");
    }
  }, [clients, customClientName]);

  // Live simulation loop for running tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        let stateChanged = false;
        
        const nextTasks = prevTasks.map((t) => {
          if (t.status !== "running") return t;

          stateChanged = true;
          // Calculate step increments depending on simulator speed
          const increment = Math.floor(Math.random() * 8) + 4;
          const nextProgress = Math.min(100, t.progress + increment);
          const nextStep = getAgentSubSteps(t.agentRole, nextProgress);

          if (t.progress !== nextProgress) {
            // Log sub-step changes occasionally or at completion
            const oldStep = t.currentStep;
            if (nextProgress === 100) {
              setTimeout(() => {
                addSystemLog(
                  t.agentRole.toUpperCase(),
                  `Pipeline operation successfully finalized for client "${t.clientName}": "${t.title}". Access metrics integrated.`,
                  "success"
                );
              }, 10);
            } else if (oldStep !== nextStep && Math.random() > 0.4) {
              setTimeout(() => {
                addSystemLog(
                  t.agentRole.toUpperCase(),
                  `[Task Progress ${nextProgress}%]: ${nextStep}`,
                  "agent"
                );
              }, 10);
            }
          }

          return {
            ...t,
            progress: nextProgress,
            currentStep: nextStep,
            status: nextProgress === 100 ? "completed" : "running"
          } as AgentTask;
        });

        return stateChanged ? nextTasks : prevTasks;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [setTasks, addSystemLog]);

  // Actions
  const handleTogglePlayPause = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isRunning = t.status === "running";
          const nextStatus = isRunning ? "pending" : "running";
          
          addSystemLog(
            "SYSTEM",
            `Task pipeline "${t.title}" for client ${t.clientName} ${isRunning ? "PAUSED" : "DISPATCHED LIVE"}.`,
            isRunning ? "warning" : "info"
          );

          return {
            ...t,
            status: nextStatus,
            currentStep: isRunning ? "Execution paused by supervisor" : "Resuming execution pipeline..."
          };
        }
        return t;
      })
    );
  };

  const handleRestartTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          addSystemLog(
            "SYSTEM",
            `Re-dispatched task execution pipeline "${t.title}" for client ${t.clientName}. Memory buffers cleared.`,
            "info"
          );

          return {
            ...t,
            status: "running",
            progress: 0,
            currentStep: getAgentSubSteps(t.agentRole, 0),
            dispatchedAt: new Date().toLocaleString()
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove the task: "${title}"?`)) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addSystemLog("SYSTEM", `Operational task "${title}" deleted from cache directory.`, "error");
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const chosenAgent = AGENT_PROFILES.find((p) => p.role === customRole);
    const uniqueId = "tsk_" + Math.random().toString(36).substring(2, 9);

    const newTask: AgentTask = {
      id: uniqueId,
      title: customTitle.trim(),
      clientName: customClientName,
      agentRole: customRole,
      agentName: chosenAgent ? chosenAgent.name : "Unknown Agent",
      status: "running",
      progress: 0,
      description: customDescription.trim() || "Bespoke operations request submitted via Supervisor console.",
      currentStep: getAgentSubSteps(customRole, 0),
      dispatchedAt: new Date().toLocaleString()
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsCreating(false);
    
    // Clear form
    setCustomTitle("");
    setCustomDescription("");

    addSystemLog(
      "SYSTEM",
      `Dispatched dynamic operational node: "${newTask.title}" assigned to ${newTask.agentName} (${newTask.agentRole} Core).`,
      "success"
    );
  };

  // Filter logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.clientName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.agentName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.agentRole.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(filterQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalTasksCount = tasks.length;
  const runningCount = tasks.filter((t) => t.status === "running").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const failedCount = tasks.filter((t) => t.status === "failed").length;

  const getAgentAssignedTask = (role: string) => {
    return tasks.find((t) => t.agentRole === role && t.status === "running");
  };

  // Visual helper colors for Agent Badges
  const getBadgeColors = (role: string) => {
    switch (role) {
      case "Director": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Reviewer": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Researcher": return "bg-purple-50 text-purple-700 border-purple-200";
      case "SEO": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "AEO": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6 text-slate-800 font-sans animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2.5">
            <Activity className="w-5.5 h-5.5 text-blue-600 animate-pulse" />
            <span>Agent Task Dispatcher & Live Tracker</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor background multi-agent executions, view real-time sub-steps, and dispatch dynamic operational tasks.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 transition flex items-center space-x-2 cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch Custom Task</span>
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tasks</div>
          <div className="text-xl font-bold text-slate-900 mt-1 flex items-baseline justify-between">
            <span>{totalTasksCount}</span>
            <ListTodo className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Lively Processing</div>
          <div className="text-xl font-bold text-blue-600 mt-1 flex items-baseline justify-between">
            <span>{runningCount}</span>
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Completed Logs</div>
          <div className="text-xl font-bold text-emerald-600 mt-1 flex items-baseline justify-between">
            <span>{completedCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Queued Standby</div>
          <div className="text-xl font-bold text-amber-600 mt-1 flex items-baseline justify-between">
            <span>{pendingCount}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs col-span-2 md:col-span-1">
          <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Anomalies</div>
          <div className="text-xl font-bold text-rose-600 mt-1 flex items-baseline justify-between">
            <span>{failedCount}</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
        </div>
      </div>

      {/* AGENT CORES LIVE STATUS GRID */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 pl-1">
          <Cpu className="w-4 h-4 text-slate-400" />
          <span>Active Agent Core Workloads</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {AGENT_PROFILES.map((profile) => {
            const activeTask = getAgentAssignedTask(profile.role);
            const isProcessing = !!activeTask;

            return (
              <div 
                key={profile.role}
                className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3.5 relative overflow-hidden transition-all duration-300 ${
                  isProcessing 
                    ? "border-blue-500/80 shadow-md shadow-blue-50/40 ring-1 ring-blue-100" 
                    : "border-slate-200"
                }`}
              >
                {/* Visual pulse line for active processing */}
                {isProcessing && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 overflow-hidden">
                    <div className="w-1/2 h-full bg-blue-300 animate-[loading_1.5s_infinite_linear]" />
                  </div>
                )}

                {/* Agent Header Identity */}
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={profile.avatar} 
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      isProcessing ? "bg-blue-500 animate-pulse" : "bg-slate-300"
                    }`} />
                  </div>

                  <div className="leading-tight">
                    <div className="font-bold text-xs text-slate-900 leading-none">{profile.name}</div>
                    <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border mt-1 inline-block ${getBadgeColors(profile.role)}`}>
                      {profile.role} Core
                    </span>
                  </div>
                </div>

                {/* Subtext description / Current activity */}
                <div className="space-y-1 bg-slate-50/80 border border-slate-100 p-2.5 rounded-lg">
                  <div className="text-[9px] text-slate-400 font-bold uppercase flex items-center justify-between">
                    <span>COGNITIVE STATUS</span>
                    <span className={`font-black ${isProcessing ? "text-blue-600 animate-pulse" : "text-slate-400"}`}>
                      {isProcessing ? "PROCESSING" : "IDLE"}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-700 font-mono leading-normal mt-1 min-h-[36px] line-clamp-3">
                    {isProcessing 
                      ? activeTask.currentStep 
                      : "Ready. Standby for operational dispatcher signals."}
                  </p>
                </div>

                {/* Progress Mini bar */}
                {isProcessing && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                      <span>Task Progress</span>
                      <span className="font-bold">{activeTask.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${activeTask.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TASK LIST DIRECTORY */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* List Header Filter Panel */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ListTodo className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Central Task Registry Directory
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search inputs */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search registries..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 w-full sm:w-56 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Status filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Registries</option>
              <option value="running">Processing</option>
              <option value="pending">Standby</option>
              <option value="completed">Completed</option>
              <option value="failed">Anomalies</option>
            </select>
          </div>
        </div>

        {/* Task Data Grid list */}
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Sliders className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No operational records found matching filter constraints.</p>
            <button 
              onClick={() => { setFilterQuery(""); setStatusFilter("all"); }}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Operations Request</th>
                  <th className="p-4">Target Client</th>
                  <th className="p-4">Assigned Agent Node</th>
                  <th className="p-4">Simulated Pipeline Progress</th>
                  <th className="p-4">Dispatch Timestamp</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const agent = AGENT_PROFILES.find((p) => p.role === task.agentRole);
                  
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/30 transition duration-150">
                      {/* Task Info */}
                      <td className="p-4 pl-6 max-w-sm">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-xs flex items-center space-x-2">
                            <span>{task.title}</span>
                            <span className="text-[9px] font-mono font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {task.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">
                            {task.description}
                          </p>
                          {task.status === "running" && (
                            <span className="text-[9px] text-blue-600 font-medium font-mono block bg-blue-50 px-2 py-0.5 rounded border border-blue-100 self-start w-fit">
                              Step: {task.currentStep}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Client website context */}
                      <td className="p-4 font-semibold text-slate-700">
                        {task.clientName}
                      </td>

                      {/* Assigned Agent badge */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {agent && (
                            <img 
                              src={agent.avatar} 
                              alt={agent.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <div className="leading-tight">
                            <div className="font-semibold text-slate-800 text-[11px]">{task.agentName}</div>
                            <span className={`text-[8px] font-bold px-1.5 py-0.1 rounded border mt-0.5 inline-block ${getBadgeColors(task.agentRole)}`}>
                              {task.agentRole} Core
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status and Progress Bar */}
                      <td className="p-4">
                        <div className="space-y-1.5 max-w-[160px]">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className={`px-1.5 py-0.5 rounded-full font-sans text-[9px] ${
                              task.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : task.status === "running"
                                ? "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                                : task.status === "failed"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {task.status === "running" ? "Processing" : task.status.toUpperCase()}
                            </span>
                            <span className="font-mono text-slate-500">{task.progress}%</span>
                          </div>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                task.status === "completed"
                                  ? "bg-emerald-500"
                                  : task.status === "failed"
                                  ? "bg-rose-500"
                                  : "bg-blue-600"
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Dispatched Date */}
                      <td className="p-4 font-mono text-[10px] text-slate-400">
                        {task.dispatchedAt}
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Play/Pause */}
                          {task.status !== "completed" && task.status !== "failed" && (
                            <button
                              onClick={() => handleTogglePlayPause(task.id)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                task.status === "running"
                                  ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                                  : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                              }`}
                              title={task.status === "running" ? "Pause Execution Pipeline" : "Dispatch Pipeline"}
                            >
                              {task.status === "running" ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Re-run / Retry */}
                          {(task.status === "completed" || task.status === "failed") && (
                            <button
                              onClick={() => handleRestartTask(task.id)}
                              className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                              title="Restart pipeline node"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-1.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Purge Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OVERLAY: CUSTOM TASK DISPATCH BUILDER */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span>SUPERVISOR AGENT DISPATCH SYSTEM</span>
              </div>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                Close Window
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Operations Request Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrape YouTube keyword density profiles"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Client Selector & Agent Selector Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Target Client Dossier</label>
                  <select
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition cursor-pointer"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.website})
                      </option>
                    ))}
                    <option value="Global Operations Core">Global Operations Core</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Assign Specialty Core</label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition cursor-pointer"
                  >
                    <option value="Director">Director Core (Aiden Cross)</option>
                    <option value="Reviewer">Reviewer Core (Serena Chen)</option>
                    <option value="Researcher">Researcher Core (Marcus Vance)</option>
                    <option value="SEO">SEO Specialist Core (Sophia Patel)</option>
                    <option value="AEO">AEO Intelligence Core (Kai Takahashi)</option>
                  </select>
                </div>
              </div>

              {/* Simulation speed & optional parameter config */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Simulated Neural Clock speed</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "fast", label: "Hyperdrive (Fast)" },
                    { id: "medium", label: "Optimized (Normal)" },
                    { id: "slow", label: "Deep Inference (Slow)" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSimSpeed(s.id as any)}
                      className={`py-2 border rounded-lg font-semibold transition cursor-pointer ${
                        simSpeed === s.id
                          ? "border-blue-500 bg-blue-50/40 text-blue-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Agent Task Context Directives</label>
                <textarea
                  rows={3}
                  placeholder="Provide precise contextual objectives for the agent..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition leading-tight"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700 transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Dispatch Agent Node</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
