import React, { useState } from "react";
import { 
  Cpu, 
  Globe, 
  TrendingUp, 
  Zap, 
  Layers, 
  Plus, 
  Search, 
  X, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Calculator, 
  Copy, 
  Check, 
  Trash2, 
  CheckSquare, 
  Square, 
  FileSignature,
  PlusCircle
} from "lucide-react";
import { Service } from "../types";

interface ServicesViewProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  addSystemLog: (source: string, msg: string, type: "info" | "success" | "warning" | "error" | "agent") => void;
}

export default function ServicesView({ services, setServices, addSystemLog }: ServicesViewProps) {
  // View States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculator State
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Modal Form States
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState<Service["category"]>("AEO Optimization");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServiceDeliverableInput, setNewServiceDeliverableInput] = useState("");
  const [newServiceDeliverables, setNewServiceDeliverables] = useState<string[]>([]);

  // Toast State
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

  const handleAddDeliverable = () => {
    if (!newServiceDeliverableInput.trim()) return;
    setNewServiceDeliverables(prev => [...prev, newServiceDeliverableInput.trim()]);
    setNewServiceDeliverableInput("");
  };

  const handleRemoveDeliverable = (index: number) => {
    setNewServiceDeliverables(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNewServiceName("");
    setNewServiceCategory("AEO Optimization");
    setNewServicePrice("");
    setNewServiceDesc("");
    setNewServiceDeliverables([]);
    setNewServiceDeliverableInput("");
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice.trim() || !newServiceDesc.trim()) {
      triggerToast("Please fill in all required service details.", "warning");
      return;
    }

    const uniqueId = "srv_custom_" + Math.random().toString(36).substring(2, 9);
    const newService: Service = {
      id: uniqueId,
      name: newServiceName.trim(),
      category: newServiceCategory,
      price: newServicePrice.trim(),
      description: newServiceDesc.trim(),
      deliverables: newServiceDeliverables.length > 0 ? newServiceDeliverables : ["Standard service delivery SLA coverage."],
      isCustom: true
    };

    setServices(prev => [...prev, newService]);
    addSystemLog("SYSTEM", `Deployed new custom service node: "${newService.name}" under ${newService.category}`, "success");
    triggerToast(`Service "${newService.name}" deployed successfully!`, "success");
    
    // Auto-select in calculator
    setSelectedServiceIds(prev => [...prev, uniqueId]);

    resetForm();
    setIsModalOpen(false);
  };

  const handleDeleteService = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to discard service node "${name}"?`)) return;
    setServices(prev => prev.filter(s => s.id !== id));
    setSelectedServiceIds(prev => prev.filter(selectedId => selectedId !== id));
    addSystemLog("SYSTEM", `Custom service node "${name}" decommissioned.`, "warning");
    triggerToast(`Service "${name}" removed.`, "info");
  };

  const toggleSelectService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(prev => prev.filter(sid => sid !== id));
    } else {
      setSelectedServiceIds(prev => [...prev, id]);
    }
  };

  // Filter Logic
  const filteredServices = services.filter(srv => {
    const matchesCategory = selectedCategoryFilter === "ALL" || srv.category === selectedCategoryFilter;
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate Retainer Estimates
  const selectedServicesObjects = services.filter(s => selectedServiceIds.includes(s.id));
  
  const calculateTotalRetainer = () => {
    let totalMonthly = 0;
    let totalOneTime = 0;

    selectedServicesObjects.forEach(s => {
      const cleanedPrice = s.price.replace(/[^0-9]/g, "");
      const numericVal = parseInt(cleanedPrice, 10) || 0;
      if (s.price.toLowerCase().includes("one-time")) {
        totalOneTime += numericVal;
      } else {
        totalMonthly += numericVal;
      }
    });

    return { totalMonthly, totalOneTime };
  };

  const { totalMonthly, totalOneTime } = calculateTotalRetainer();

  // Generate Agreement scope markdown text
  const generateAgreementScopeMarkdown = () => {
    if (selectedServicesObjects.length === 0) {
      return "No services selected. Choose service modules from the left inventory to generate a contract scope outline.";
    }

    let md = `### 7HIVE MEDIA+ SERVICE LEVEL AGREEMENT SCOPE\n`;
    md += `**DATE**: ${new Date().toLocaleDateString()}\n`;
    md += `**ESTIMATED TOTALS**:\n`;
    if (totalMonthly > 0) md += `- **Monthly Retainer**: ₹${totalMonthly.toLocaleString('en-IN')}/mo\n`;
    if (totalOneTime > 0) md += `- **One-Time Implementation Fee**: ₹${totalOneTime.toLocaleString('en-IN')} One-time\n`;
    md += `\n---\n\n`;

    selectedServicesObjects.forEach((srv, idx) => {
      md += `#### ${idx + 1}. ${srv.name} (${srv.category})\n`;
      md += `*Price: ${srv.price}*\n`;
      md += `> ${srv.description}\n\n`;
      md += `**Standard Deliverables & SLA commitments**:\n`;
      srv.deliverables.forEach(del => {
        md += `- ${del}\n`;
      });
      md += `\n`;
    });

    md += `---\n*Generated by 7HIVE Media+ Operations Center. Copy this text to inject directly into smart client agreement templates.*`;
    return md;
  };

  const handleCopyScope = () => {
    const text = generateAgreementScopeMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    addSystemLog("SYSTEM", "Calculated services SLA scope copied to clipboard.", "info");
    triggerToast("SLA Scope markdown copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 text-slate-800 font-sans relative">
      
      {/* Toast Notification HUD */}
      {toast.type && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-3 bg-slate-900 text-slate-100 px-4 py-3 rounded-xl shadow-xl border border-slate-700/50 animate-bounce max-w-sm font-sans">
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
          {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
          <div className="text-xs font-semibold">{toast.message}</div>
        </div>
      )}

      {/* Left Column: Filter Sidebar + Services Grid */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200 bg-slate-50/50">
        
        {/* Upper Action Bar */}
        <div className="p-6 bg-white border-b border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm select-none">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Service Node Inventory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define operational intelligence modules, website-as-a-service SLA tiers, and media distribution scopes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Configure New Service</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "AEO Optimization", "Web Development", "Organic Search Growth", "Content & Copywriting", "Other"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {cat === "ALL" ? "All Formats" : cat}
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search active services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Services Bento Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredServices.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-slate-200 rounded-xl bg-white p-6">
              <Info className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">No Service Nodes Found</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                No matching service formats correspond with your keyword query or category selection filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredServices.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                const isCustom = srv.isCustom;

                // Pick Service Category Icon
                let IconComponent = Cpu;
                let themeColor = "bg-blue-50 text-blue-600 border-blue-100";
                if (srv.category === "Web Development") {
                  IconComponent = Globe;
                  themeColor = "bg-teal-50 text-teal-600 border-teal-100";
                } else if (srv.category === "Organic Search Growth") {
                  IconComponent = TrendingUp;
                  themeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                } else if (srv.category === "Content & Copywriting") {
                  IconComponent = Zap;
                  themeColor = "bg-purple-50 text-purple-600 border-purple-100";
                } else if (srv.category === "Other") {
                  IconComponent = Layers;
                  themeColor = "bg-indigo-50 text-indigo-600 border-indigo-100";
                }

                return (
                  <div
                    key={srv.id}
                    id={`srv-card-${srv.id}`}
                    className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? "border-blue-400 shadow-sm ring-1 ring-blue-400/30" 
                        : "border-slate-200/80 shadow-xs"
                    }`}
                  >
                    <div>
                      {/* Badge and Price */}
                      <div className="flex items-start justify-between">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${themeColor}`}>
                          {srv.category}
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900 tracking-tight block">
                            {srv.price}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">
                            RETAINER UNIT
                          </span>
                        </div>
                      </div>

                      {/* Header Title */}
                      <h3 className="font-bold text-slate-950 text-sm mt-3 tracking-tight flex items-center space-x-2">
                        <IconComponent className="w-4 h-4 shrink-0 text-slate-600" />
                        <span>{srv.name}</span>
                      </h3>
                      
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {srv.description}
                      </p>

                      {/* Deliverables List */}
                      <div className="mt-4 space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          SLA DELIVERABLES & OBJECTIVES
                        </span>
                        <ul className="space-y-1">
                          {srv.deliverables.map((del, idx) => (
                            <li key={idx} className="text-[10px] text-slate-600 flex items-start space-x-1.5 leading-snug">
                              <span className="text-blue-500 font-bold select-none">•</span>
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => toggleSelectService(srv.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Included in Estimate</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5" />
                            <span>Select Module</span>
                          </>
                        )}
                      </button>

                      {isCustom && (
                        <button
                          onClick={() => handleDeleteService(srv.id, srv.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Discard Custom Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Sleek high-tech Retainer Calculator sidebar */}
      <div className="w-96 border-l border-slate-200 bg-white flex flex-col overflow-hidden shrink-0">
        
        {/* Calculator Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-950 text-sm tracking-tight">
              Retainer Scope Configurator
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Bundle services in real-time to compute client pricing & custom SLA outline documents.
            </p>
          </div>
        </div>

        {/* Pricing Summary Panels */}
        <div className="p-6 border-b border-slate-100 bg-white grid grid-cols-2 gap-3 select-none">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">MONTHLY RETAINER</span>
            <span className="text-lg font-black text-blue-600 tracking-tight mt-0.5 block">
              ₹{totalMonthly.toLocaleString('en-IN')}
              <span className="text-[10px] font-normal text-slate-500">/mo</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">ONE-TIME SETUP</span>
            <span className="text-lg font-black text-slate-800 tracking-tight mt-0.5 block">
              ₹{totalOneTime.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Selected modules mini list */}
        <div className="px-6 py-4 bg-slate-50/40 border-b border-slate-100 space-y-2 select-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SELECTED CONTEXTS ({selectedServicesObjects.length})
          </span>
          {selectedServicesObjects.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">No modules toggled.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {selectedServicesObjects.map(s => (
                <div key={s.id} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-700 flex items-center space-x-1">
                  <span>{s.name}</span>
                  <button 
                    onClick={() => toggleSelectService(s.id)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Scope Document Preview Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-2 px-1 select-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <FileSignature className="w-3 h-3 text-slate-400" />
              <span>SLA Outline Document Preview</span>
            </span>
            {selectedServicesObjects.length > 0 && (
              <button
                onClick={handleCopyScope}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 bg-white border border-slate-200/80 rounded-xl p-4 overflow-y-auto text-left shadow-inner font-mono text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap">
            {generateAgreementScopeMarkdown()}
          </div>
        </div>

        {/* Integration notice */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-500 flex items-start space-x-2 select-none">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <span>
            <strong>Protip:</strong> Copy the generated SLA Outline markdown text and paste it into the <strong>"Services Scope Override"</strong> textbox inside the Smart Agreements tab.
          </span>
        </div>

      </div>

      {/* Double Column Configure New Service Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    Deploy Custom Service Node
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Inject customized deliverables, SLA commitments, and payment rates directly into the operations cache.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1.5 hover:bg-slate-100 rounded-lg transition"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateService} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(85vh-140px)] overflow-y-auto">
                
                {/* Left Column: Coordinates & Rates */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-1.5">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Service Identity & Pricing</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Service Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="e.g. Tik-Tok Organic Distribution Engine"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Format Category</label>
                      <select
                        value={newServiceCategory}
                        onChange={(e) => setNewServiceCategory(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      >
                        <option value="AEO Optimization">AEO Optimization</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Organic Search Growth">Organic Search Growth</option>
                        <option value="Content & Copywriting">Content & Copywriting</option>
                        <option value="Other">Other Proposal / Audit Format</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Price / Retainer Rate <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        placeholder="e.g. ₹1,00,000/mo or ₹85,000 one-time"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Short Description <span className="text-rose-500">*</span></label>
                    <textarea
                      rows={3}
                      required
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      placeholder="Describe the operational core of this service module..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Right Column: Dynamic Deliverables Creator */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-1.5">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Dynamic SLA Deliverables</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Add Custom Deliverable</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newServiceDeliverableInput}
                        onChange={(e) => setNewServiceDeliverableInput(e.target.value)}
                        placeholder="e.g. Bi-weekly custom video production review sessions"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddDeliverable();
                          }
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={handleAddDeliverable}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Added list */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      DELIVERABLES PREVIEW LIST ({newServiceDeliverables.length})
                    </span>
                    {newServiceDeliverables.length === 0 ? (
                      <div className="border border-dashed border-slate-200 rounded-lg p-4 text-center text-xs text-slate-400 bg-slate-50/40">
                        No deliverables added yet. Use the input field above to build an SLA scope list.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-slate-50/20 divide-y divide-slate-100">
                        {newServiceDeliverables.map((del, idx) => (
                          <div key={idx} className="p-2.5 flex items-start justify-between gap-3 text-xs text-slate-700 hover:bg-slate-50">
                            <span className="leading-snug break-words flex-1">
                              <strong>{idx + 1}.</strong> {del}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDeliverable(idx)}
                              className="text-rose-500 hover:text-rose-700 font-bold px-1 transition"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 border border-slate-200 bg-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deploy Service Node</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
