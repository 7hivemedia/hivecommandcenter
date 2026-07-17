import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Sparkles, 
  Trash2, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  BookOpen, 
  Key, 
  DollarSign, 
  Globe,
  Loader2,
  FileText
} from "lucide-react";
import { Client, RetainerPlan } from "../types";

interface ClientsViewProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  retainerPlans: RetainerPlan[];
  addSystemLog: (source: string, msg: string, type: "info" | "success" | "warning" | "error" | "agent") => void;
}

export default function ClientsView({ 
  clients, 
  setClients, 
  retainerPlans,
  addSystemLog 
}: ClientsViewProps) {
  // Navigation states
  const [activeClientId, setActiveClientId] = useState<string>(clients[0]?.id || "");
  const [activeReportTab, setActiveReportTab] = useState<"main" | "reviewer" | "researcher" | "seo" | "aeo">("main");
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);

  // Form states
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientServices, setNewClientServices] = useState("");
  const [newClientWebsite, setNewClientWebsite] = useState("");
  const [newClientPaymentPlan, setNewClientPaymentPlan] = useState("Standard WAAS Plan - ₹1,25,000/mo");
  const [newClientNoteKey, setNewClientNoteKey] = useState("");
  const [onboardingDocument, setOnboardingDocument] = useState<File | null>(null);

  // Auto-select first client when list loads or changes
  React.useEffect(() => {
    if (clients.length > 0 && (!activeClientId || !clients.some(c => c.id === activeClientId))) {
      setActiveClientId(clients[0].id);
    }
  }, [clients, activeClientId]);

  // Keep payment plan synchronized with available retainer plans
  React.useEffect(() => {
    if (retainerPlans.length > 0) {
      const defaultPlan = `${retainerPlans[0].name} - ${retainerPlans[0].price}`;
      if (!newClientPaymentPlan || !retainerPlans.some(rp => `${rp.name} - ${rp.price}` === newClientPaymentPlan)) {
        setNewClientPaymentPlan(defaultPlan);
      }
    }
  }, [retainerPlans, newClientPaymentPlan]);

  const selectedClient = clients.find(c => c.id === activeClientId);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) {
      alert("Name and Email are required fields.");
      return;
    }

    const uniqueId = "cli_" + Math.random().toString(36).substring(2, 9);
    const brandName = newClientName.trim();

    const created: Client = {
      id: uniqueId,
      name: brandName,
      mail: newClientEmail.trim(),
      phone: newClientPhone.trim() || "+91 99201 23456",
      address: newClientAddress.trim() || "Remote Client Address",
      services: newClientServices.trim() || "Brand positioning analysis, SEO strategy, content generation",
      document: onboardingDocument ? onboardingDocument.name : "raw_direct_onboarding.json",
      usernames: "@" + brandName.toLowerCase().replace(/\s+/g, ""),
      passwords: "temp_token_" + Math.random().toString(36).substring(2, 6) + "x",
      website: newClientWebsite.trim() || "https://example.com",
      paymentPlan: newClientPaymentPlan,
      noteKey: newClientNoteKey.trim() || "No custom override notes supplied.",
      onboardedAt: new Date().toLocaleDateString(),
      status: "pending",
      auditStatus: "idle",
      auditProgress: 0,
      activeAgentIndex: -1,
      agentOutputs: {
        main: "",
        reviewer: "",
        researcher: "",
        seo: "",
        aeo: ""
      }
    };

    setClients(prev => [...prev, created]);
    setActiveClientId(uniqueId);
    
    // Clear inputs and reset step
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientAddress("");
    setNewClientServices("");
    setNewClientWebsite("");
    setNewClientNoteKey("");
    setOnboardingDocument(null);
    setOnboardingStep(1);

    addSystemLog("DIRECTOR", `New client record registered: ${brandName}`, "success");
    addSystemLog("SYSTEM", `Dossier compilation queued for client ID ${uniqueId}`, "info");
  };

  const handleDeleteClient = (id: string) => {
    if (!confirm("Are you sure you want to delete this client directory? All agent telemetry reports will be destroyed.")) return;
    const item = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    if (activeClientId === id) {
      const remaining = clients.filter(c => c.id !== id);
      if (remaining.length > 0) setActiveClientId(remaining[0].id);
    }
    if (item) {
      addSystemLog("SYSTEM", `Client directory removed: ${item.name}`, "warning");
    }
  };

  // Triggers sequential multi-agent pipeline
  const runMultiAgentOnboardingPipeline = async (clientId: string) => {
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return;

    const targetClient = clients[clientIndex];
    if (targetClient.auditStatus === "running") return;

    addSystemLog("DIRECTOR", `Initiating Multi-Agent Pipeline for client: ${targetClient.name}`, "info");

    // Helper to update specific fields for client
    const updateClientState = (updates: Partial<Client>) => {
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
    };

    updateClientState({
      auditStatus: "running",
      auditProgress: 10,
      activeAgentIndex: 0
    });

    const agentSteps = [
      { name: "Director Dispatch", role: "main", progress: 20 },
      { name: "Brand Reviewer Audit", role: "reviewer", progress: 40 },
      { name: "Content Researcher Discovery", role: "researcher", progress: 60 },
      { name: "SEO Strategist Index Map", role: "seo", progress: 80 },
      { name: "AEO Optimizer Citation Blueprint", role: "aeo", progress: 100 }
    ];

    for (let i = 0; i < agentSteps.length; i++) {
      const step = agentSteps[i];
      updateClientState({ activeAgentIndex: i, auditProgress: step.progress });
      addSystemLog("DIRECTOR", `Node active: ${step.name}. Consulting Gemini Core...`, "agent");

      try {
        // Send actual Gemini proxy request
        const res = await fetch("/api/agent-pipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: targetClient,
            agentRole: step.role
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Save progress to intermediate agent outputs
        setClients(prev => prev.map(c => {
          if (c.id === clientId) {
            const outputs = { ...c.agentOutputs, [step.role]: data.output };
            return { ...c, agentOutputs: outputs };
          }
          return c;
        }));

        addSystemLog(step.role.toUpperCase(), `Report compiled and returned successfully.`, "success");
      } catch (err: any) {
        console.error(`Pipeline step failed: ${step.name}`, err);
        addSystemLog("SYSTEM", `Communication fault during ${step.name}: ${err.message}`, "error");
        
        // Fallback mock generation in case of API limits or issues
        setClients(prev => prev.map(c => {
          if (c.id === clientId) {
            const fallbackText = `### ${step.name.toUpperCase()} - FAILURE RESCUE REPORT\n\n- **Client Name**: ${c.name}\n- **Website**: ${c.website}\n- **Analysis Objective**: ${c.services}\n\n*System rescued connection. Gemini API connection timed out, returned fallback strategic outline.*`;
            const outputs = { ...c.agentOutputs, [step.role]: fallbackText };
            return { ...c, agentOutputs: outputs };
          }
          return c;
        }));
      }

      // Add delay for a nice interactive feel
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Complete the audit
    updateClientState({
      auditStatus: "completed",
      auditProgress: 100,
      activeAgentIndex: -1,
      status: "active"
    });
    addSystemLog("DIRECTOR", `Multi-Agent Pipeline completed for ${targetClient.name}. Ready for agreement generation.`, "success");
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* Left panel: Directory listing */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white select-none">
        <div className="p-4 border-b border-slate-100">
          <span className="font-semibold text-[10px] tracking-wider text-slate-400 block uppercase">
            CLIENT DIRECTORY
          </span>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Manage profiles and trigger marketing audits.</p>
        </div>

        {/* Client Items list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {clients.length === 0 ? (
            <div className="text-slate-400 text-xs text-center py-8">No clients currently registered.</div>
          ) : (
            clients.map((cli) => {
              const isSelected = cli.id === activeClientId;
              return (
                <div
                  key={cli.id}
                  onClick={() => setActiveClientId(cli.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? "bg-blue-50 border-blue-200 text-blue-900 shadow-sm" 
                      : "bg-transparent border-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs truncate max-w-[150px]">{cli.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                      cli.status === "active" 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}>
                      {cli.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block mt-1 truncate">{cli.website}</span>
                  
                  {/* Pipeline small progress bar indicator */}
                  {cli.auditStatus === "running" && (
                    <div className="mt-2.5">
                      <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 mb-1">
                        <span>PIPELINE RUNNING</span>
                        <span>{cli.auditProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                          style={{ width: `${cli.auditProgress}%` }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Middle/Right dynamic dossiers layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {selectedClient ? (
          <>
            {/* Middle: Client Info details */}
            <div className="w-full md:w-96 border-r border-slate-200 bg-white overflow-y-auto p-5 space-y-5 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Client Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{selectedClient.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {selectedClient.id}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    className="p-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Contact coordinates list */}
                <div className="space-y-3 text-xs">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                    CONTACT PROFILE
                  </span>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">EMAIL COORDINATE</span>
                    <span className="font-semibold text-slate-700">{selectedClient.mail}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">PHONE NUMBER</span>
                    <span className="font-mono text-slate-700">{selectedClient.phone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">BUSINESS WEBSITE</span>
                    <a href={selectedClient.website} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline flex items-center space-x-1 mt-0.5">
                      <Globe className="w-3 h-3 inline" />
                      <span>{selectedClient.website}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">HEADQUARTERS ADDRESS</span>
                    <span className="text-slate-600">{selectedClient.address}</span>
                  </div>
                </div>

                {/* Scope requirements block */}
                <div className="space-y-3 text-xs pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                    ENGAGEMENT TERMS
                  </span>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">RETAINER DISBURSEMENT</span>
                    <span className="font-semibold text-slate-700">{selectedClient.paymentPlan}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">SPECIFIED SERVICES</span>
                    <span className="text-slate-600 font-medium">{selectedClient.services}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">BRIEF DOCUMENTATION</span>
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded px-2 py-1 mt-1 font-mono text-[10px] text-slate-500">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{selectedClient.document}</span>
                    </div>
                  </div>
                </div>

                {/* Account overrides */}
                <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                    SECURED INGRESS CREDENTIALS
                  </span>
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>USERNAMES:</span>
                      <span className="font-bold text-slate-700">{selectedClient.usernames}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>TEMPORARY KEY:</span>
                      <span className="font-bold text-slate-700 bg-slate-200 px-1 rounded">{selectedClient.passwords}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100">
                {selectedClient.auditStatus === "idle" ? (
                  <button
                    onClick={() => runMultiAgentOnboardingPipeline(selectedClient.id)}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Multi-Agent Onboarding</span>
                  </button>
                ) : selectedClient.auditStatus === "running" ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg bg-slate-100 text-slate-400 font-semibold text-xs flex items-center justify-center space-x-2 border border-slate-200 cursor-not-allowed"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Pipeline Running ({selectedClient.auditProgress}%)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => runMultiAgentOnboardingPipeline(selectedClient.id)}
                    className="w-full py-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rerun Analysis Pipeline</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right: Dynamic report console outputs */}
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center select-none">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">Agent Telemetry Analysis Dossier</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Dossier: {selectedClient.name.toUpperCase()}_REPORT_SECURE</p>
                </div>
              </div>

              {/* Tabs for agent reports */}
              <div className="flex border-b border-slate-200 bg-white text-xs select-none">
                {[
                  { id: "main", label: "Overview" },
                  { id: "reviewer", label: "Reviewer" },
                  { id: "researcher", label: "Researcher" },
                  { id: "seo", label: "SEO" },
                  { id: "aeo", label: "AEO" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveReportTab(t.id as any)}
                    className={`px-5 py-3 border-b-2 font-medium transition-all cursor-pointer ${
                      activeReportTab === t.id 
                        ? "border-blue-600 text-blue-700" 
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Reports display pane */}
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedClient.auditStatus === "idle" ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-3">
                    <BookOpen className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Analysis Pipeline</p>
                    <p className="text-[10px] max-w-sm leading-relaxed text-slate-400">
                      Press "Run Multi-Agent Onboarding" on the left panel to execute sequential Gemini tasks.
                    </p>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    {/* Render corresponding Markdown output */}
                    <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed font-sans space-y-4">
                      {selectedClient.agentOutputs[activeReportTab] ? (
                        <div className="whitespace-pre-wrap">
                          {selectedClient.agentOutputs[activeReportTab]}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-3">
                          <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                          <p className="font-mono text-[10px]">Segment core output not compiled yet. Running pipeline segment...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center space-y-3 bg-slate-50">
            <Users className="w-10 h-10 text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Clients Loaded</p>
            <p className="text-[10px] text-slate-400 max-w-sm">Use the forms below to onboarding clients.</p>
          </div>
        )}
      </div>

      {/* Onboarding Trigger Button */}
      {onboardingStep === 1 && (
        <div className="fixed bottom-6 right-6 z-30 font-sans">
          <button
            onClick={() => setOnboardingStep(2)}
            className="px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New Client</span>
          </button>
        </div>
      )}

      {/* Big Beautiful Dialog Overlay Modal */}
      {onboardingStep === 2 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    Onboard New Client Profile
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure target intelligence coordinates and service scopes for autonomous multi-agent analysis.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setOnboardingStep(1)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1.5 hover:bg-slate-100 rounded-lg transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateClient} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(85vh-140px)] overflow-y-auto">
                {/* Left Column: Client Identity & Coordinates */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Identity & Contact Coordinates</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Brand Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="e.g. Acme Studio"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Email Address <span className="text-rose-500">*</span></label>
                      <input
                        type="email"
                        required
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        placeholder="e.g. hello@acme.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Phone Number</label>
                      <input
                        type="text"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        placeholder="+91 99201 23456"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Website URL</label>
                      <input
                        type="text"
                        value={newClientWebsite}
                        onChange={(e) => setNewClientWebsite(e.target.value)}
                        placeholder="https://acme.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Retainer Model</label>
                    <select
                      value={newClientPaymentPlan}
                      onChange={(e) => setNewClientPaymentPlan(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    >
                      {retainerPlans.map((rp) => (
                        <option key={rp.id} value={`${rp.name} - ${rp.price}`}>
                          {rp.name} - {rp.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Headquarters Address</label>
                    <input
                      type="text"
                      value={newClientAddress}
                      onChange={(e) => setNewClientAddress(e.target.value)}
                      placeholder="e.g. 100 Main St, Chicago, IL"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Right Column: Services, Guidelines & Dossiers */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Services, Guidelines & Dossier</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Specified Services</label>
                    <textarea
                      rows={2}
                      value={newClientServices}
                      onChange={(e) => setNewClientServices(e.target.value)}
                      placeholder="e.g. SEO indexing clusters, viral copywriting campaigns"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Internal Override Notes</label>
                    <textarea
                      rows={2}
                      value={newClientNoteKey}
                      onChange={(e) => setNewClientNoteKey(e.target.value)}
                      placeholder="Any unique business intelligence, override guidelines, or custom notes..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Drag drop upload mock */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Dossier Brief Document</label>
                    <div 
                      className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center text-xs text-slate-500 hover:bg-slate-50/50 cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.onchange = (e: any) => {
                          if (e.target.files && e.target.files[0]) {
                            setOnboardingDocument(e.target.files[0]);
                          }
                        };
                        input.click();
                      }}
                    >
                      <FileText className="w-6 h-6 text-slate-400" />
                      {onboardingDocument ? (
                        <div className="text-center">
                          <span className="font-semibold text-blue-600 block">✓ {onboardingDocument.name}</span>
                          <span className="text-[10px] text-slate-400 block">File size: {(onboardingDocument.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-semibold text-slate-700 block text-[11px]">Drag & drop dossier briefing PDF, or click to browse</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Maximum upload limit: 10MB (PDF, DOCX, TXT)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 border border-slate-200 bg-white transition cursor-pointer"
                >
                  Cancel Onboarding
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register & Compile Dossier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
