import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Terminal, 
  Settings, 
  ShieldCheck,
  Cpu,
  LayoutGrid,
  ListTodo,
  LogOut,
  User as UserIcon
} from "lucide-react";

interface SidebarProps {
  activeTab: "dashboard" | "clients" | "services" | "agreements" | "chat" | "settings" | "tasks";
  setActiveTab: (tab: "dashboard" | "clients" | "services" | "agreements" | "chat" | "settings" | "tasks") => void;
  systemStatus: "ONLINE" | "STANDBY" | "MAINTENANCE";
  currentUser: any;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, systemStatus, currentUser, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clients", label: "Client Directory", icon: Users },
    { id: "services", label: "Services", icon: LayoutGrid },
    { id: "agreements", label: "Smart Agreements", icon: FileText },
    { id: "tasks", label: "Agent Tasks", icon: ListTodo },
    { id: "chat", label: "Agent Chat Console", icon: Terminal },
    { id: "settings", label: "Preferences", icon: Settings },
  ] as const;


  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen select-none font-sans text-slate-800">
      {/* Brand logo section */}
      <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
          <Cpu className="w-5.5 h-5.5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">
            7HIVE Media+
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-1">
            OPERATIONS HUB v4.2
          </p>
        </div>
      </div>

      {/* Main navigation links */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-semibold tracking-wider text-slate-400 px-3 mb-2 uppercase">
          Workspace Nodes
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                isActive 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* User profile details & Sign Out */}
      {currentUser && (
        <div className="mx-4 mb-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between space-x-3 shadow-sm">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-blue-400 flex items-center justify-center border border-slate-800 shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-900 truncate">
                {currentUser.displayName || "Commander"}
              </p>
              <p className="text-[9px] text-slate-400 font-mono truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            title="Disconnect Uplink"
            className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status Indicators at bottom */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/50 text-[11px] space-y-3">
        <div className="flex items-center justify-between text-slate-500">
          <span className="font-medium text-slate-400">SECURE SHELL</span>
          <div className="flex items-center space-x-1 text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px]">TLS 1.3 Active</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-500">
          <span className="font-medium text-slate-400">ENGINE CORES</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${
              systemStatus === "ONLINE" 
                ? "bg-emerald-500 animate-pulse" 
                : systemStatus === "MAINTENANCE" 
                ? "bg-amber-500" 
                : "bg-blue-500"
            }`} />
            <span className={`text-[10px] font-bold uppercase ${
              systemStatus === "ONLINE" 
                ? "text-emerald-600" 
                : systemStatus === "MAINTENANCE" 
                ? "text-amber-600" 
                : "text-blue-600"
            }`}>
              {systemStatus.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
