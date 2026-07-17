import React, { useState } from "react";
import { 
  Settings, 
  HelpCircle, 
  RefreshCw, 
  Check, 
  Upload, 
  FileText,
  Terminal,
  Save,
  Trash2,
  Sliders,
  ChevronRight,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Cpu,
  Layers,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Grid
} from "lucide-react";
import { RetainerPlan } from "../types";

interface SettingsViewProps {
  templates: {
    services: string;
    waas: string;
    other: string;
  };
  setTemplates: React.Dispatch<React.SetStateAction<{
    services: string;
    waas: string;
    other: string;
  }>>;
  retainerPlans: RetainerPlan[];
  setRetainerPlans: React.Dispatch<React.SetStateAction<RetainerPlan[]>>;
  addSystemLog: (source: string, msg: string, type: "info" | "success" | "warning" | "error" | "agent") => void;
  systemStatus: "ONLINE" | "STANDBY" | "MAINTENANCE";
  setSystemStatus: (status: "ONLINE" | "STANDBY" | "MAINTENANCE") => void;
}

interface Permission {
  key: string;
  name: string;
  description: string;
}

interface PermissionGroup {
  module: string;
  icon: any;
  permissions: Permission[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  badge: string;
  color: string;
  isCustom?: boolean;
  permissions: Record<string, boolean>;
}

export default function SettingsView({ 
  templates, 
  setTemplates, 
  retainerPlans,
  setRetainerPlans,
  addSystemLog,
  systemStatus,
  setSystemStatus
}: SettingsViewProps) {
  // Navigation Tabs at page level
  const [activeTab, setActiveTab] = useState<"templates" | "rbac" | "retainers">("rbac");

  // Local state for templates so editing is seamless
  const [localServices, setLocalServices] = useState(templates.services);
  const [localWaas, setLocalWaas] = useState(templates.waas);
  const [localOther, setLocalOther] = useState(templates.other);
  const [saved, setSaved] = useState(false);

  // RBAC Config State
  const [selectedRoleId, setSelectedRoleId] = useState<string>("super_admin");
  const [rbacSubTab, setRbacSubTab] = useState<"checklist" | "matrix" | "sandbox">("checklist");
  const [searchQuery, setSearchQuery] = useState("");

  // Sandbox States
  const [sandboxRoleId, setSandboxRoleId] = useState("super_admin");
  const [sandboxPermissionKey, setSandboxPermissionKey] = useState("client_decrypt_pw");
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  // New Custom Role Builder states
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleBadge, setNewRoleBadge] = useState("Custom Node");
  const [newRoleColor, setNewRoleColor] = useState("purple");
  const [cloneFromRoleId, setCloneFromRoleId] = useState("ops_manager");

  // Retainer Plan Operator States
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanName, setEditingPlanName] = useState("");
  const [editingPlanPrice, setEditingPlanPrice] = useState("");

  const handleAddRetainerPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim() || !newPlanPrice.trim()) return;
    
    const newPlan: RetainerPlan = {
      id: "rp_" + Math.random().toString(36).substring(2, 9),
      name: newPlanName.trim(),
      price: newPlanPrice.trim()
    };
    
    setRetainerPlans(prev => [...prev, newPlan]);
    setNewPlanName("");
    setNewPlanPrice("");
    addSystemLog("SETTINGS", `Added new retainer model: ${newPlan.name} (${newPlan.price})`, "success");
  };

  const handleUpdateRetainerPlan = (id: string) => {
    if (!editingPlanName.trim() || !editingPlanPrice.trim()) return;
    
    setRetainerPlans(prev => prev.map(p => p.id === id ? { ...p, name: editingPlanName.trim(), price: editingPlanPrice.trim() } : p));
    setEditingPlanId(null);
    setEditingPlanName("");
    setEditingPlanPrice("");
    addSystemLog("SETTINGS", `Updated retainer model: ${editingPlanName}`, "success");
  };

  const handleDeleteRetainerPlan = (id: string) => {
    const target = retainerPlans.find(p => p.id === id);
    if (!target) return;
    
    if (retainerPlans.length <= 1) {
      alert("At least one retainer model is required.");
      return;
    }
    
    setRetainerPlans(prev => prev.filter(p => p.id !== id));
    addSystemLog("SETTINGS", `Removed retainer model: ${target.name}`, "warning");
  };

  // Default initial values for resetting
  const defaultServices = `# 7HIVE MEDIA+ SERVICES AGREEMENT

**PARTIES**: 7HIVE MEDIA+ ("Agency") and [ClientName] ("Client").
**CLIENT EMAIL**: [ClientEmail]
**WEBSITE**: [Website]
**SERVICES**: [ServicesScope]

## 1. SCOPE OF SERVICES
Agency shall perform digital marketing and media creation services as specified:
- [ServicesScope]

## 2. COMPENSATION & PAYMENTS
- Pricing & Payment terms: [PaymentTerms]

## 3. TERM & DURATION
- Effective duration: [Duration]

## 4. STANDARD TERMS & INTELLECTUAL PROPERTY
All materials created specifically for the Client shall become the property of the Client upon complete payment.

## 5. SPECIFIC RIDER / ADDITIONAL CLAUSES
[SpecificClauses]`;

  const defaultWaas = `# 7HIVE MEDIA+ WAAS (WEBSITE-AS-A-SERVICE) AGREEMENT

**PARTIES**: 7HIVE MEDIA+ ("Provider") and [ClientName] ("Subscriber").
**SUBSCRIBED DOMAIN**: [Website]

## 1. WAAS SUBSCRIPTION SCOPE
Continuous cloud maintenance, landing page development, search marketing proxy updates, and visual enhancements.
- [ServicesScope]

## 2. RECURRING SERVICE TERMS
- Monthly subscription payment: [PaymentTerms]
- Minimum Subscription Commitment: [Duration]

## 3. SLA & MAINTENANCE WINDOWS
Weekly security patches, 99.9% uptime website hosting proxy, and continuous on-demand support.

## 4. CLAUSES & CONDITIONS
[SpecificClauses]`;

  const defaultOther = `# 7HIVE MEDIA+ MARKETING PROPOSAL & AGREEMENT

Prepared for: [ClientName] ([ClientEmail])
Target Asset: [Website]

## STRATEGIC SCOPE
- [ServicesScope]

## DISBURSEMENT SCHEDULING
- Terms: [PaymentTerms]
- Project Span: [Duration]

## SUPPLEMENTAL CLAUSES
[SpecificClauses]`;

  // Static Permissions Specification
  const PERMISSION_GROUPS: PermissionGroup[] = [
    {
      module: "Client Directory Claims",
      icon: Users,
      permissions: [
        { key: "client_view", name: "Access Client Records", description: "Read credentials lists, active pipelines, and historic onboarding folders." },
        { key: "client_create", name: "Create Client Profile", description: "Register new client accounts and write metadata parameters." },
        { key: "client_edit_notes", name: "Modify Secret Note Keys", description: "Write internal brand strategies and developer keys." },
        { key: "client_decrypt_pw", name: "View Cryptographic Passwords", description: "Decrypt raw client integration passwords and API tokens." },
        { key: "client_run_audit", name: "Trigger Autonomous Audits", description: "Dispatch sequential AI neural network evaluation processes." }
      ]
    },
    {
      module: "Billing & Catalog Claims",
      icon: Grid,
      permissions: [
        { key: "service_view", name: "View Base Catalog", description: "Access standard list of digital, SEO, and WAAS packages." },
        { key: "service_custom_rate", name: "Set Custom Retainers", description: "Configure custom pricing, billing frequencies, or discounts." },
        { key: "service_create_pkg", name: "Add Custom Package types", description: "Design a new custom service product or write bespoke deliverables." }
      ]
    },
    {
      module: "Smart Agreements & Legal Claims",
      icon: FileText,
      permissions: [
        { key: "agreement_view_drafts", name: "Browse Legal Documents", description: "Access draft databases, read compiled text outputs, and status indexes." },
        { key: "agreement_compile", name: "Compile Live Agreements", description: "Parse dynamic tokens and generate finished legally binding drafts." },
        { key: "agreement_edit_template", name: "Modify System Blueprints", description: "Directly edit master markdown agreement boilerplates." },
        { key: "agreement_upload_custom", name: "Upload Custom Legal Files", description: "Drag, drop, and parse external formats or custom contracts." },
        { key: "agreement_sign_download", name: "Authorize Sign & Download", description: "Apply operations signature credentials and fetch high-fidelity documents." }
      ]
    },
    {
      module: "AI Neural Copilot Core Claims",
      icon: Cpu,
      permissions: [
        { key: "agent_edit_instructions", name: "Rewrite Agent Directives", description: "Modify central system instructions for Director, Reviewer, and SEO agents." },
        { key: "agent_tune_temp", name: "Tune Hyperparameters", description: "Adjust model parameters (temperature metrics, top_p, and limits)." },
        { key: "agent_clear_memory", name: "Flush Agent Memory Buffers", description: "Purge active memory states and conversational logs." },
        { key: "agent_chat_console", name: "Use Chat command terminal", description: "Interact directly with models using the live system command console." }
      ]
    },
    {
      module: "Global System Claims",
      icon: Settings,
      permissions: [
        { key: "system_status_toggle", name: "Modify Operating State", description: "Change node state between ONLINE, STANDBY, and MAINTENANCE." },
        { key: "system_flush_logs", name: "Flush Chronological Logs", description: "Wipe all system logger, client audit, and agent history logs." },
        { key: "system_restore_defaults", name: "Factory Reset Blueprints", description: "Wipe template custom modifications and reload system factory layouts." }
      ]
    }
  ];

  // Flattened list of permissions for utility mapping
  const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(g => g.permissions);

  // Initialize Roles database state
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "super_admin",
      name: "Super Administrator",
      description: "Full root access with absolute read/write capabilities across all system modules.",
      badge: "Root Owner",
      color: "red",
      permissions: {
        client_view: true, client_create: true, client_edit_notes: true, client_decrypt_pw: true, client_run_audit: true,
        service_view: true, service_custom_rate: true, service_create_pkg: true,
        agreement_view_drafts: true, agreement_compile: true, agreement_edit_template: true, agreement_upload_custom: true, agreement_sign_download: true,
        agent_edit_instructions: true, agent_tune_temp: true, agent_clear_memory: true, agent_chat_console: true,
        system_status_toggle: true, system_flush_logs: true, system_restore_defaults: true
      }
    },
    {
      id: "ops_manager",
      name: "Operations Manager",
      description: "Manages day-to-day client onboarding, billing, service pricing, and drafting contracts.",
      badge: "Staff Lead",
      color: "blue",
      permissions: {
        client_view: true, client_create: true, client_edit_notes: true, client_decrypt_pw: true, client_run_audit: true,
        service_view: true, service_custom_rate: true, service_create_pkg: true,
        agreement_view_drafts: true, agreement_compile: true, agreement_edit_template: false, agreement_upload_custom: true, agreement_sign_download: true,
        agent_edit_instructions: false, agent_tune_temp: false, agent_clear_memory: true, agent_chat_console: true,
        system_status_toggle: true, system_flush_logs: false, system_restore_defaults: false
      }
    },
    {
      id: "seo_specialist",
      name: "SEO / Content Specialist",
      description: "Focuses on optimizing brand search/AEO layouts and reviewing generated contents.",
      badge: "Creative",
      color: "purple",
      permissions: {
        client_view: true, client_create: false, client_edit_notes: false, client_decrypt_pw: false, client_run_audit: true,
        service_view: true, service_custom_rate: false, service_create_pkg: false,
        agreement_view_drafts: true, agreement_compile: false, agreement_edit_template: false, agreement_upload_custom: false, agreement_sign_download: false,
        agent_edit_instructions: true, agent_tune_temp: true, agent_clear_memory: false, agent_chat_console: true,
        system_status_toggle: false, system_flush_logs: false, system_restore_defaults: false
      }
    },
    {
      id: "ai_copilot",
      name: "AI Autonomous Agent",
      description: "Direct background task processing agent engine. Operates automatically.",
      badge: "Agentic Hub",
      color: "emerald",
      permissions: {
        client_view: true, client_create: false, client_edit_notes: true, client_decrypt_pw: false, client_run_audit: true,
        service_view: true, service_custom_rate: false, service_create_pkg: false,
        agreement_view_drafts: true, agreement_compile: true, agreement_edit_template: false, agreement_upload_custom: false, agreement_sign_download: false,
        agent_edit_instructions: false, agent_tune_temp: false, agent_clear_memory: true, agent_chat_console: true,
        system_status_toggle: false, system_flush_logs: false, system_restore_defaults: false
      }
    },
    {
      id: "client_portal",
      name: "Client Representative",
      description: "Read-only workspace node access for client-side reviewers to monitor live logs.",
      badge: "External",
      color: "amber",
      permissions: {
        client_view: true, client_create: false, client_edit_notes: false, client_decrypt_pw: false, client_run_audit: false,
        service_view: true, service_custom_rate: false, service_create_pkg: false,
        agreement_view_drafts: true, agreement_compile: false, agreement_edit_template: false, agreement_upload_custom: false, agreement_sign_download: true,
        agent_edit_instructions: false, agent_tune_temp: false, agent_clear_memory: false, agent_chat_console: false,
        system_status_toggle: false, system_flush_logs: false, system_restore_defaults: false
      }
    }
  ]);

  // Action: Save Master templates
  const handleSaveTemplates = () => {
    setTemplates({
      services: localServices,
      waas: localWaas,
      other: localOther
    });
    setSaved(true);
    addSystemLog("SYSTEM", "System agreement templates updated successfully.", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  // Action: Reset factory templates
  const handleResetTemplates = () => {
    if (!confirm("Are you sure you want to restore all agreement formats to system factory defaults?")) return;
    setLocalServices(defaultServices);
    setLocalWaas(defaultWaas);
    setLocalOther(defaultOther);
    setTemplates({
      services: defaultServices,
      waas: defaultWaas,
      other: defaultOther
    });
    addSystemLog("SYSTEM", "Factory defaults restored for contract formats.", "warning");
  };

  // RBAC Action: Toggle individual permission check
  const handleTogglePermission = (roleId: string, permKey: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const currentVal = !!role.permissions[permKey];
        const updatedPermissions = {
          ...role.permissions,
          [permKey]: !currentVal
        };
        
        // Log changes
        addSystemLog(
          "SECURITY", 
          `Modified claims for role "${role.name}": "${permKey}" was set to ${!currentVal ? "ENABLED" : "DISABLED"}`, 
          !currentVal ? "success" : "warning"
        );

        return {
          ...role,
          permissions: updatedPermissions
        };
      }
      return role;
    }));
  };

  // RBAC Action: Create a custom brand role
  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const uniqueId = "role_" + Math.random().toString(36).substring(2, 9);
    
    // Clone permissions from parent chosen role
    const parentRole = roles.find(r => r.id === cloneFromRoleId);
    const initialPermissions = parentRole ? { ...parentRole.permissions } : {};

    const newlyBuiltRole: Role = {
      id: uniqueId,
      name: newRoleName.trim(),
      description: newRoleDesc.trim() || "Bespoke user access scope defined for agency operations.",
      badge: newRoleBadge.trim() || "Bespoke",
      color: newRoleColor,
      isCustom: true,
      permissions: initialPermissions
    };

    setRoles(prev => [...prev, newlyBuiltRole]);
    setSelectedRoleId(uniqueId);
    setIsCreatingRole(false);
    
    // Clear inputs
    setNewRoleName("");
    setNewRoleDesc("");
    setNewRoleBadge("Custom Node");
    setNewRoleColor("purple");

    addSystemLog("SECURITY", `Successfully registered custom operating role profile: "${newlyBuiltRole.name}" (Cloned from ${parentRole?.name || "root"}).`, "success");
  };

  // RBAC Action: Delete custom role
  const handleDeleteCustomRole = (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the custom role: "${roleName}"?`)) return;
    setRoles(prev => prev.filter(r => r.id !== roleId));
    if (selectedRoleId === roleId) {
      setSelectedRoleId("super_admin");
    }
    addSystemLog("SECURITY", `Removed custom operational role "${roleName}" from database registry.`, "error");
  };

  // RBAC Action: Execute Security Sandbox simulation
  const handleRunSimulation = () => {
    setSandboxLoading(true);
    setSandboxResult(null);

    setTimeout(() => {
      const selectedRole = roles.find(r => r.id === sandboxRoleId);
      const isGranted = !!selectedRole?.permissions[sandboxPermissionKey];
      const selectedPerm = ALL_PERMISSIONS.find(p => p.key === sandboxPermissionKey);

      setSandboxResult({
        timestamp: new Date().toISOString(),
        roleName: selectedRole?.name || "Unknown",
        roleBadge: selectedRole?.badge || "N/A",
        claimKey: sandboxPermissionKey,
        claimLabel: selectedPerm?.name || "Unknown Claim",
        isAuthorized: isGranted,
        digest: Math.random().toString(16).substring(2, 10).toUpperCase()
      });

      setSandboxLoading(false);

      if (isGranted) {
        addSystemLog("SANDBOX", `RBAC Access Check: PASS for ${selectedRole?.name} -> [${sandboxPermissionKey}]`, "success");
      } else {
        addSystemLog("SANDBOX", `RBAC Access Check: REJECTED for ${selectedRole?.name} -> [${sandboxPermissionKey}]`, "error");
      }
    }, 500);
  };

  const activeRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  // Helper color map
  const getBadgeColorClasses = (color: string) => {
    switch(color) {
      case "red": return "bg-rose-50 text-rose-700 border-rose-200";
      case "blue": return "bg-blue-50 text-blue-700 border-blue-200";
      case "purple": return "bg-purple-50 text-purple-700 border-purple-200";
      case "emerald": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "amber": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getBadgeDotColor = (color: string) => {
    switch(color) {
      case "red": return "bg-rose-500";
      case "blue": return "bg-blue-500";
      case "purple": return "bg-purple-500";
      case "emerald": return "bg-emerald-500";
      case "amber": return "bg-amber-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6 text-slate-800 font-sans">
      {/* Header with Title and Segmented Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <Shield className="w-5.5 h-5.5 text-blue-600" />
            <span>Preferences & Authorization</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure default formats, network operation states, and deep security role permissions.
          </p>
        </div>

        {/* Global tab selector */}
        <div className="flex bg-slate-200/55 p-1 rounded-xl self-start md:self-center select-none shadow-sm">
          <button
            onClick={() => setActiveTab("rbac")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "rbac"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Roles & Access Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "templates"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Agreement Blueprints</span>
          </button>
          <button
            onClick={() => setActiveTab("retainers")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "retainers"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Retainer Models</span>
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: BLUEPRINTS AND MASTER TEMPLATES */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left side: System configuration */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-xs">
              <h3 className="font-bold text-xs text-slate-900 tracking-tight flex items-center space-x-1.5 border-b border-slate-100 pb-2.5">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>CORES REGISTRY OPERATOR</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">SYSTEM OPERATING STATE</label>
                <select 
                  value={systemStatus}
                  onChange={(e) => {
                    const val = e.target.value as "ONLINE" | "STANDBY" | "MAINTENANCE";
                    setSystemStatus(val);
                    addSystemLog("SYSTEM", `System operating state toggled to: ${val}`, "warning");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ONLINE">ONLINE (ACTIVE PIPELINES)</option>
                  <option value="STANDBY">SECURE STANDBY BYPASS</option>
                  <option value="MAINTENANCE">SYSTEM UNDER MAINTENANCE</option>
                </select>
              </div>

              <div className="pt-2.5 space-y-2 leading-relaxed">
                <div className="flex items-center space-x-1.5 text-slate-700 font-semibold border-b border-slate-100 pb-1">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>CONTRACT DYNAMIC TOKENS:</span>
                </div>
                <p className="text-slate-500 text-[10px]">When compiling agreements, the central parser maps and replaces the following parameters:</p>
                <div className="space-y-1 bg-slate-55 border border-slate-150 rounded-lg p-2.5 font-mono text-[9px] text-slate-600 leading-tight">
                  <div className="flex justify-between"><span>[ClientName]</span><span className="text-slate-400 font-sans">Company Name</span></div>
                  <div className="flex justify-between"><span>[ClientEmail]</span><span className="text-slate-400 font-sans">Email Address</span></div>
                  <div className="flex justify-between"><span>[Website]</span><span className="text-slate-400 font-sans">Target Asset</span></div>
                  <div className="flex justify-between"><span>[ServicesScope]</span><span className="text-slate-400 font-sans">Scope Terms</span></div>
                  <div className="flex justify-between"><span>[PaymentTerms]</span><span className="text-slate-400 font-sans">Retainer Model</span></div>
                  <div className="flex justify-between"><span>[Duration]</span><span className="text-slate-400 font-sans">Time Commit</span></div>
                  <div className="flex justify-between"><span>[SpecificClauses]</span><span className="text-slate-400 font-sans">Custom Rider</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Template layout editors */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-xs text-slate-900 tracking-tight">
                AGREEMENT TEMPLATE COMPOSITION
              </h3>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetTemplates}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Restore Default</span>
                </button>

                <button
                  onClick={handleSaveTemplates}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Templates</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Services templates */}
              <div className="space-y-1">
                <label className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Services Agreement Blueprint</span>
                </label>
                <textarea
                  rows={5}
                  value={localServices}
                  onChange={(e) => setLocalServices(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono text-[11px] focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* WAAS Template */}
              <div className="space-y-1">
                <label className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>WAAS Agreement Blueprint</span>
                </label>
                <textarea
                  rows={5}
                  value={localWaas}
                  onChange={(e) => setLocalWaas(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono text-[11px] focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Other proposals Template */}
              <div className="space-y-1">
                <label className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Other / Pitch Proposal Blueprint</span>
                </label>
                <textarea
                  rows={5}
                  value={localOther}
                  onChange={(e) => setLocalOther(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono text-[11px] focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 3: RETAINER MODELS CONSOLE */}
      {activeTab === "retainers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column: Form to add a plan */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm text-xs">
              <h3 className="font-bold text-xs text-slate-900 tracking-tight flex items-center space-x-1.5 border-b border-slate-100 pb-2.5">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>CREATE RETAINER MODEL</span>
              </h3>
              
              <form onSubmit={handleAddRetainerPlan} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">MODEL NAME</label>
                  <input
                    type="text"
                    required
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g. Premium Growth Plan"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">PRICE RATE</label>
                  <input
                    type="text"
                    required
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                    placeholder="e.g. ₹2,50,000/mo"
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Retainer</span>
                </button>
              </form>
            </div>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-[11px] text-slate-600 leading-relaxed">
              <p className="font-semibold text-blue-900 flex items-center space-x-1 mb-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>Operator Directive</span>
              </p>
              These retainer plans are fully synchronized in real-time. Registered retainer options immediately become available under the "Onboard New Client" payment models dropdown directory.
            </div>
          </div>

          {/* Right Column: Existing Retainer Plans list */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col space-y-4">
            <div>
              <h3 className="font-bold text-xs text-slate-900 tracking-tight flex items-center space-x-1.5 border-b border-slate-100 pb-2.5">
                <Grid className="w-4 h-4 text-slate-500" />
                <span>RETAINER REGISTRY DIRECTORY</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {retainerPlans.length === 0 ? (
                <div className="text-slate-400 text-center py-10 text-xs font-medium">
                  No retainer models registered. Add a model on the left panel.
                </div>
              ) : (
                retainerPlans.map((plan) => {
                  const isEditing = editingPlanId === plan.id;
                  return (
                    <div key={plan.id} className="py-4 flex items-center justify-between text-xs gap-4 first:pt-0 last:pb-0">
                      {isEditing ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold block">NAME</label>
                            <input
                              type="text"
                              value={editingPlanName}
                              onChange={(e) => setEditingPlanName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800"
                            />
                          </div>
                          <div className="space-y-1 flex flex-col justify-between">
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block">PRICE</label>
                              <input
                                type="text"
                                value={editingPlanPrice}
                                onChange={(e) => setEditingPlanPrice(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-800 font-medium"
                              />
                            </div>
                            <div className="flex items-center space-x-2 mt-2 self-end">
                              <button
                                onClick={() => handleUpdateRetainerPlan(plan.id)}
                                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPlanId(null)}
                                className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-0.5 flex-1">
                            <span className="font-bold text-slate-900 text-sm block">{plan.name}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="font-mono font-semibold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                {plan.price}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {plan.id}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingPlanId(plan.id);
                                setEditingPlanName(plan.name);
                                setEditingPlanPrice(plan.price);
                              }}
                              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                              title="Edit model"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRetainerPlan(plan.id)}
                              className="p-1.5 rounded border border-rose-100 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete model"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* RENDER TAB 2: RBAC (ROLE-BASED ACCESS CONTROL) CONSOLE */}
      {activeTab === "rbac" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Column A (Span 4): Roles Registry Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col h-full">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 tracking-tight flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>SYSTEM SECURITY ROLES</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle and modify active claims.</p>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {roles.length} Loaded
                </span>
              </div>

              {/* Roles listing */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] lg:max-h-[500px] pr-1">
                {roles.map((role) => {
                  const isSelected = selectedRoleId === role.id;
                  const activeCount = Object.values(role.permissions).filter(Boolean).length;
                  const colorClass = getBadgeColorClasses(role.color);
                  const dotColor = getBadgeDotColor(role.color);

                  return (
                    <div
                      key={role.id}
                      onClick={() => {
                        setSelectedRoleId(role.id);
                        setIsCreatingRole(false);
                      }}
                      className={`group p-3 border rounded-xl text-left transition-all duration-150 cursor-pointer flex flex-col relative select-none ${
                        isSelected 
                          ? "border-blue-500 bg-blue-50/20 shadow-sm" 
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/30 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                          {role.name}
                        </span>
                        
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${colorClass}`}>
                            {role.badge}
                          </span>
                          {role.isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomRole(role.id, role.name);
                              }}
                              className="text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                              title="Delete custom role profile"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                        {role.description}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-2 text-[9px] text-slate-400">
                        <span className="font-mono flex items-center space-x-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          <span>Claims Enabled:</span>
                        </span>
                        <span className="font-bold text-slate-700 font-mono">
                          {activeCount} / {ALL_PERMISSIONS.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Role Section Trigger Button */}
              {!isCreatingRole ? (
                <button
                  onClick={() => setIsCreatingRole(true)}
                  className="w-full py-2 border border-dashed border-blue-200 text-blue-600 hover:border-blue-500 hover:bg-blue-50/30 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Custom Role Profile</span>
                </button>
              ) : (
                <form onSubmit={handleCreateCustomRole} className="p-4 border border-blue-200 bg-blue-50/10 rounded-xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                    <span className="text-[10px] text-blue-800 font-extrabold uppercase">NEW ROLE CONTEXT</span>
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingRole(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">ROLE TITLE <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Lead Auditor"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">DESCRIPTION</label>
                    <textarea 
                      placeholder="Operational responsibilities..."
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      rows={2}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 leading-tight"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">BADGE PILL</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Bespoke"
                        value={newRoleBadge}
                        onChange={(e) => setNewRoleBadge(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">COLOR SCHEMA</label>
                      <select
                        value={newRoleColor}
                        onChange={(e) => setNewRoleColor(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="purple">Purple (Creative)</option>
                        <option value="blue">Blue (Ops)</option>
                        <option value="emerald">Emerald (AI/Automation)</option>
                        <option value="amber">Amber (External)</option>
                        <option value="red">Red (Root)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">INITIAL CLAIMS CLONE TEMPLATE</label>
                    <select
                      value={cloneFromRoleId}
                      onChange={(e) => setCloneFromRoleId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>Clone "{r.name}" permissions</option>
                      ))}
                      <option value="">Start from Scratch (All False)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Register Brand Role</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column B (Span 8): Configuration Workspace */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            {/* Control Header with Sub-tabs (Checklist / Matrix / Simulator) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className={`w-2 h-2 rounded-full ${getBadgeDotColor(activeRole.color)}`} />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                    <span>Active Profile:</span>
                    <span className="text-blue-600 font-black">{activeRole.name}</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">Configuring {Object.values(activeRole.permissions).filter(Boolean).length} authorized claims.</p>
                </div>
              </div>

              {/* Sub tab selectors */}
              <div className="flex space-x-1 bg-slate-100 p-0.5 rounded-lg select-none text-[10px] font-bold">
                <button
                  onClick={() => setRbacSubTab("checklist")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    rbacSubTab === "checklist"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Granular Checklist
                </button>
                <button
                  onClick={() => setRbacSubTab("matrix")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    rbacSubTab === "matrix"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Roles Matrix Grid
                </button>
                <button
                  onClick={() => setRbacSubTab("sandbox")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    rbacSubTab === "sandbox"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Security Sandbox Simulator
                </button>
              </div>
            </div>

            {/* RENDER SUBTAB 2A: DETAILED CHECKLIST OF CLAIMS */}
            {rbacSubTab === "checklist" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 flex-1 max-h-[560px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-4">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-slate-400" />
                    <span>GRANULAR MODULE PERMISSION CHECKLIST</span>
                  </div>
                  
                  {/* Local filter search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search permission claims..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-[10px] w-48 text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Filter and render groups */}
                <div className="space-y-6">
                  {PERMISSION_GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    // Filter matching search
                    const filteredPerms = group.permissions.filter(p => 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      p.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      p.description.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (filteredPerms.length === 0) return null;

                    return (
                      <div key={group.module} className="space-y-3.5">
                        {/* Group Header */}
                        <div className="bg-slate-50/80 border border-slate-100 rounded-lg px-3.5 py-2.5 flex items-center space-x-2 text-slate-900">
                          <GroupIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-[11px] font-extrabold uppercase tracking-wider">
                            {group.module}
                          </span>
                        </div>

                        {/* List of elements inside Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-1">
                          {filteredPerms.map((perm) => {
                            const isChecked = !!activeRole.permissions[perm.key];
                            return (
                              <div 
                                key={perm.key}
                                onClick={() => handleTogglePermission(activeRole.id, perm.key)}
                                className={`border rounded-xl p-3 flex items-start space-x-3 transition-all cursor-pointer select-none ${
                                  isChecked 
                                    ? "bg-slate-50/50 border-slate-200 hover:border-slate-300" 
                                    : "bg-white border-slate-150 hover:border-slate-250 opacity-80"
                                }`}
                              >
                                {/* Toggle switch indicator */}
                                <div className="pt-0.5">
                                  <div className={`w-8 h-4.5 rounded-full p-0.5 transition-all duration-200 ${isChecked ? "bg-blue-600" : "bg-slate-200"}`}>
                                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-200 ${isChecked ? "translate-x-3.5" : "translate-x-0"}`} />
                                  </div>
                                </div>

                                {/* Content description */}
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 leading-none">
                                      {perm.name}
                                    </span>
                                    <span className="text-[8px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {perm.key}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 leading-relaxed">
                                    {perm.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RENDER SUBTAB 2B: FULL INTERACTIVE SECURITY MATRIX GRID */}
            {rbacSubTab === "matrix" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 flex-1 overflow-x-auto max-h-[560px]">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Grid className="w-4 h-4 text-slate-500" />
                    <span>CENTRAL SECURITY CLAIMS MATRIX MATRIX</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Click any cell indicator grid checkpoint to directly toggle permission states across different roles.</p>
                </div>

                <table className="w-full border-collapse border border-slate-100 text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 select-none text-[10px] text-slate-600 uppercase font-black tracking-wider">
                      <th className="p-3 border-r border-slate-100 min-w-[200px]">Operational Claim Description</th>
                      {roles.map(r => (
                        <th key={r.id} className="p-3 border-r border-slate-100 text-center min-w-[120px] max-w-[150px]">
                          <div className="flex flex-col items-center">
                            <span className="text-slate-900 font-bold font-sans tracking-tight text-[11px] block text-center line-clamp-1">{r.name}</span>
                            <span className="text-[8px] font-normal text-slate-400 mt-0.5 block">{r.badge}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_GROUPS.map((group) => (
                      <React.Fragment key={group.module}>
                        {/* Section Group title row */}
                        <tr className="bg-slate-100/50 border-y border-slate-200 select-none">
                          <td colSpan={roles.length + 1} className="p-2.5 font-extrabold text-[9px] uppercase text-blue-800 tracking-wider font-mono">
                            {group.module}
                          </td>
                        </tr>
                        {group.permissions.map((perm) => (
                          <tr key={perm.key} className="hover:bg-slate-50/50 border-b border-slate-100 transition-all text-[11px]">
                            <td className="p-3 font-medium text-slate-700 border-r border-slate-150 leading-normal">
                              <span className="font-bold text-slate-900 block">{perm.name}</span>
                              <span className="text-[8px] font-mono text-slate-400 mt-0.5 block">{perm.key}</span>
                            </td>
                            {roles.map(role => {
                              const isChecked = !!role.permissions[perm.key];
                              return (
                                <td 
                                  key={role.id} 
                                  onClick={() => handleTogglePermission(role.id, perm.key)}
                                  className={`p-3 text-center border-r border-slate-100 cursor-pointer transition-colors hover:bg-blue-50/20 select-none`}
                                >
                                  <div className="flex justify-center items-center">
                                    {isChecked ? (
                                      <div className="bg-emerald-100 border border-emerald-200 rounded-full p-1 text-emerald-800 flex items-center justify-center shadow-xs" title="Access Allowed - Click to Toggle">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </div>
                                    ) : (
                                      <div className="bg-rose-100 border border-rose-200 rounded-full p-1 text-rose-800 flex items-center justify-center shadow-xs" title="Access Denied - Click to Toggle">
                                        <XCircle className="w-3.5 h-3.5" />
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* RENDER SUBTAB 2C: SECURITY SANDBOX AND PERMISSION SIMULATOR */}
            {rbacSubTab === "sandbox" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 flex-1 max-h-[560px] overflow-y-auto">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Terminal className="w-4 h-4 text-purple-600" />
                    <span>CLAIM SIMULATION SANDBOX CONSOLE</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Test simulated request permissions dynamically to verify and test access scopes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Selector controls */}
                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block border-b border-slate-150 pb-1">
                        SIMULATION PRINCIPALS & CLAIMS
                      </span>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">SELECT PRINCIPAL ROLE</label>
                        <select
                          value={sandboxRoleId}
                          onChange={(e) => setSandboxRoleId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.badge})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">SELECT PERMISSION ACTION CLAIM</label>
                        <select
                          value={sandboxPermissionKey}
                          onChange={(e) => setSandboxPermissionKey(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {PERMISSION_GROUPS.map(g => (
                            <optgroup key={g.module} label={g.module}>
                              {g.permissions.map(p => (
                                <option key={p.key} value={p.key}>{p.name} ({p.key})</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleRunSimulation}
                        disabled={sandboxLoading}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>{sandboxLoading ? "EVALUATING CLAIMS..." : "TEST ACTION AUTHORIZATION"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Terminal Display result */}
                  <div className="flex flex-col">
                    <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col flex-1 font-mono text-[11px] text-slate-300 min-h-[220px] shadow-inner relative overflow-hidden">
                      {/* Top bar */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-[9px] text-slate-500">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-mono ml-2">7HIVE-GATEWAY-AUTH-AGENT</span>
                        </span>
                        <span>STATUS: ACTIVE</span>
                      </div>

                      {sandboxLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-purple-400 select-none py-10">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          <span className="text-[10px] animate-pulse">EVALUATING SECURITY CLAIMS TREE...</span>
                        </div>
                      ) : sandboxResult ? (
                        <div className="space-y-3 flex-1 overflow-y-auto">
                          {/* Result Banner */}
                          <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                            sandboxResult.isAuthorized 
                              ? "bg-emerald-950/20 border-emerald-800/60 text-emerald-400" 
                              : "bg-rose-950/20 border-rose-800/60 text-rose-400"
                          }`}>
                            {sandboxResult.isAuthorized ? (
                              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                            ) : (
                              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            )}
                            <div className="text-[10px]">
                              <span className="font-bold block uppercase text-xs">
                                {sandboxResult.isAuthorized ? "ACCESS AUTHORIZED (CLAIM PASSED)" : "ACCESS DENIED (INSUFFICIENT ROLES)"}
                              </span>
                              <span>JWT Token verified, credential handshake completed.</span>
                            </div>
                          </div>

                          {/* Details dump */}
                          <div className="space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[10px] leading-relaxed text-slate-400">
                            <div><span className="text-slate-500">TIMESTAMP:</span> {sandboxResult.timestamp}</div>
                            <div><span className="text-slate-500">SESSION_DIGEST:</span> SHA256_{sandboxResult.digest}</div>
                            <div><span className="text-slate-500">PRINCIPAL_ROLE:</span> <span className="text-white">{sandboxResult.roleName} ({sandboxResult.roleBadge})</span></div>
                            <div><span className="text-slate-500">REQUESTED_ACTION:</span> <span className="text-white">{sandboxResult.claimLabel}</span></div>
                            <div><span className="text-slate-500">REQUIRED_CLAIM:</span> <span className="text-purple-400 font-bold">{sandboxResult.claimKey} === true</span></div>
                            <div><span className="text-slate-500">EVAL_VERDICT:</span> <span className={sandboxResult.isAuthorized ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{sandboxResult.isAuthorized ? "CLAIM_MATCHED (AUTHORIZED)" : "MISSING_REQUIRED_CLAIM (FORBIDDEN)"}</span></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-slate-500 text-center select-none py-10 leading-normal">
                          <Terminal className="w-7 h-7 text-slate-700" />
                          <div>
                            <span className="font-bold block text-slate-400">System Gateway Ready</span>
                            <span className="text-[10px]">Select a client role and permission action, then run audit trigger.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
