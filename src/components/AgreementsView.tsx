import React, { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Share2, 
  FileSignature, 
  Printer,
  ChevronRight,
  Plus,
  Search,
  X,
  Info,
  AlertCircle,
  CheckCircle2,
  Globe,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  Layers,
  Upload
} from "lucide-react";
import { Agreement } from "../types";

interface AgreementsViewProps {
  agreements: Agreement[];
  setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>;
  templates: {
    services: string;
    waas: string;
    other: string;
  };
  addSystemLog: (source: string, msg: string, type: "info" | "success" | "warning" | "error" | "agent") => void;
}

export default function AgreementsView({ 
  agreements, 
  setAgreements, 
  templates, 
  addSystemLog 
}: AgreementsViewProps) {
  // Navigation & Modal states
  const [activeDraftId, setActiveDraftId] = useState<string>(agreements[0]?.id || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto-select first draft when list loads or changes
  React.useEffect(() => {
    if (agreements.length > 0 && (!activeDraftId || !agreements.some(a => a.id === activeDraftId))) {
      setActiveDraftId(agreements[0].id);
    }
  }, [agreements, activeDraftId]);

  // Parameter Fields
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<"Services Agreement" | "WAAS Agreement" | "Other">("Services Agreement");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [servicesScope, setServicesScope] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [duration, setDuration] = useState("");
  const [specificClauses, setSpecificClauses] = useState("");

  // Creation Method (or choice Option)
  const [creationMethod, setCreationMethod] = useState<"form" | "upload">("form");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileText, setUploadedFileText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Custom Toast State
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

  const activeDraft = agreements.find(a => a.id === activeDraftId);

  // Filter agreements by search query
  const filteredAgreements = agreements.filter(agr => 
    agr.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agr.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setWebsite("");
    setServicesScope("");
    setPaymentTerms("");
    setDuration("");
    setSpecificClauses("");
    setSelectedTemplateCategory("Services Agreement");
    setCreationMethod("form");
    setUploadedFileName("");
    setUploadedFileText("");
    setIsDragOver(false);
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const isText = file.type.startsWith("text/") || 
                   file.name.endsWith(".txt") || 
                   file.name.endsWith(".md") || 
                   file.name.endsWith(".markdown") ||
                   file.name.endsWith(".json") ||
                   file.type === ""; // some operating systems don't resolve extension types for .md
    if (!isText) {
      triggerToast("Please upload a text-based format file (.txt, .md).", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setUploadedFileText(text);
      setUploadedFileName(file.name);
      
      // Proactively infer client name if empty
      if (!clientName) {
        const nameGuess = file.name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[-_]+/g, " ") // replace dashes/underscores with spaces
          .replace(/contract|agreement|template|format/gi, "") // remove generic words
          .trim();
        if (nameGuess) {
          // Capitalize first letters
          const formatted = nameGuess.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          setClientName(formatted);
        }
      }
      
      addSystemLog("SYSTEM", `Uploaded format file "${file.name}" read successfully (${file.size} bytes).`, "info");
      triggerToast(`Loaded custom format: ${file.name}`, "success");
    };
    reader.onerror = () => {
      triggerToast("Error reading the uploaded file.", "warning");
    };
    reader.readAsText(file);
  };

  // Triggers dynamic local compilation inside the modal
  const compileAgreementDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      triggerToast("Please supply a Client/Brand Name to compile an agreement.", "warning");
      return;
    }

    let compiled = "";
    if (creationMethod === "upload") {
      if (!uploadedFileText.trim()) {
        triggerToast("Please drag & drop or click to upload a contract format/template.", "warning");
        return;
      }
      compiled = uploadedFileText;
    } else {
      // Pick corresponding template
      let baseTemplate = templates.services;
      if (selectedTemplateCategory === "WAAS Agreement") {
        baseTemplate = templates.waas;
      } else if (selectedTemplateCategory === "Other") {
        baseTemplate = templates.other;
      }

      // Perform token mapping replacements
      compiled = baseTemplate
        .replace(/\[ClientName\]/g, clientName.trim())
        .replace(/\[ClientEmail\]/g, clientEmail.trim() || "contact@client.com")
        .replace(/\[Website\]/g, website.trim() || "https://client-website.com")
        .replace(/\[ServicesScope\]/g, servicesScope.trim() || "Premium digital marketing optimization services.")
        .replace(/\[PaymentTerms\]/g, paymentTerms.trim() || "Retainer payments due on the 1st of each month.")
        .replace(/\[Duration\]/g, duration.trim() || "Continuous Monthly commitment")
        .replace(/\[SpecificClauses\]/g, specificClauses.trim() || "No additional specific custom riders.");
    }

    const uniqueId = "agr_" + Math.random().toString(36).substring(2, 9);
    const newDraft: Agreement = {
      id: uniqueId,
      category: creationMethod === "upload" ? "Uploaded Format" : selectedTemplateCategory,
      clientName: clientName.trim(),
      clientEmail: creationMethod === "upload" ? "Custom File Upload" : clientEmail.trim(),
      website: creationMethod === "upload" ? "Custom" : website.trim(),
      servicesScope: creationMethod === "upload" ? "Uploaded Custom Document Structure" : servicesScope.trim(),
      paymentTerms: creationMethod === "upload" ? "Included in file" : paymentTerms.trim(),
      duration: creationMethod === "upload" ? "Included in file" : duration.trim(),
      specificClauses: creationMethod === "upload" ? "N/A" : specificClauses.trim(),
      draftContent: compiled,
      createdAt: new Date().toLocaleDateString()
    };

    setAgreements(prev => [newDraft, ...prev]);
    setActiveDraftId(uniqueId);
    addSystemLog("SYSTEM", `Compiled new agreement via ${creationMethod === "upload" ? "custom file upload" : "parameters form"} for ${clientName}`, "success");
    triggerToast(`Agreement draft successfully compiled for ${clientName}!`, "success");
    
    // Reset and close modal
    resetForm();
    setIsModalOpen(false);
  };

  const handleDeleteDraft = (id: string) => {
    if (!confirm("Are you sure you want to delete this agreement draft?")) return;
    setAgreements(prev => prev.filter(a => a.id !== id));
    if (activeDraftId === id) {
      const remaining = agreements.filter(a => a.id !== id);
      if (remaining.length > 0) setActiveDraftId(remaining[0].id);
      else setActiveDraftId("");
    }
    addSystemLog("SYSTEM", "Agreement draft discarded from HUD cache.", "warning");
    triggerToast("Draft discarded successfully.", "info");
  };

  const handleCopyClipboard = () => {
    if (!activeDraft) return;
    navigator.clipboard.writeText(activeDraft.draftContent);
    setCopied(true);
    addSystemLog("SYSTEM", "Agreement content successfully copied to clipboard.", "info");
    triggerToast("Copied agreement to clipboard!", "success");
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

      {/* Left Column: Draft list & Category templates */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white select-none shrink-0">
        
        {/* Workspace Header */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div>
            <span className="font-semibold text-[10px] tracking-wider text-slate-400 block uppercase">
              AGREEMENT WORKSPACE
            </span>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Compile customized client contracts dynamically.</p>
          </div>
          
          {/* New Agreement Trigger Button */}
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer hover:shadow active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Agreement</span>
          </button>
        </div>

        {/* Search Bar filter */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-3 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400 transition"
            />
          </div>
        </div>

        {/* Existing Agreement Draft items list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/30">
          {filteredAgreements.length === 0 ? (
            <div className="text-slate-400 text-xs text-center py-8">
              {searchQuery ? "No matching drafts." : "No agreements compiled."}
            </div>
          ) : (
            filteredAgreements.map((agr) => {
              const isSelected = agr.id === activeDraftId;
              return (
                <div
                  key={agr.id}
                  onClick={() => setActiveDraftId(agr.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? "bg-blue-50 border-blue-200 text-blue-900 shadow-sm" 
                      : "bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs truncate max-w-[150px]">{agr.clientName}</span>
                    <span className="text-[9px] text-slate-400">{agr.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-mono text-slate-400 truncate">{agr.category}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Workspace Pane: Displays Selected Agreement Document in full, professional width */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        
        {/* Document view header actions */}
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center select-none shadow-sm">
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">Compiled Agreement Sheet</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {activeDraft ? `FILE: ${activeDraft.clientName.replace(/\s+/g, "_")}_contract.md` : "Ready to compile"}
            </p>
          </div>

          {activeDraft && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => triggerToast("Printing dispatch queued successfully.", "success")}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                title="Print Document"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => triggerToast("Document shared via secure dispatch proxy channel.", "success")}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
                title="Share Document"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopyClipboard}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                title="Copy to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDeleteDraft(activeDraft.id)}
                className="p-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                title="Discard Draft"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Paper View Container */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeDraft ? (
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 shadow-md rounded-2xl p-10 font-sans text-xs text-slate-700 leading-relaxed space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono border-b border-slate-100 pb-2 mb-4">
                <span>DRAFT REFERENCE: {activeDraft.id}</span>
                <span>DATE: {activeDraft.createdAt}</span>
              </div>
              
              {/* Clean formatted paper text preview */}
              <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-xs">
                {activeDraft.draftContent}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-200" />
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">No Draft Active</p>
              <p className="text-[10px] text-slate-400 max-w-sm">
                Select an existing draft on the left panel or click "New Agreement" to compile a clean contract agreement.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Big Beautiful Dialog Overlay Modal for Add New Agreement */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    Compile Smart Client Agreement
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure terms, service scopes, and payment durations to dynamically render legally structured drafts.
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

            {/* Creation Mode Option Toggle */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Creation Method Choice:</span>
              <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCreationMethod("form")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    creationMethod === "form"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Fill Parameters Form
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMethod("upload")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    creationMethod === "upload"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Upload Format File
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={compileAgreementDraft} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[calc(85vh-180px)] overflow-y-auto">
                
                {creationMethod === "form" ? (
                  <>
                    {/* Left Column: Coordinates & Retainer details */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          <span>Template & Identity Details</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Template Layout <span className="text-rose-500">*</span></label>
                        <select
                          value={selectedTemplateCategory}
                          onChange={(e) => setSelectedTemplateCategory(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                        >
                          <option value="Services Agreement">Services Agreement Format</option>
                          <option value="WAAS Agreement">WAAS (Website-as-a-Service) Format</option>
                          <option value="Other">Other Proposal / Pitch Format</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Client / Brand Name <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Client Email</label>
                          <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="contact@client.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Domain Website</label>
                          <input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://client.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Payment Terms</label>
                          <input
                            type="text"
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                            placeholder="e.g. ₹1,25,000/mo net 15"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Duration Term</label>
                          <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="e.g. 12 Months Commit"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Scopes & custom Riders */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Scopes, Deliverables & Riders</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Services Scope Override</label>
                        <textarea
                          rows={4}
                          value={servicesScope}
                          onChange={(e) => setServicesScope(e.target.value)}
                          placeholder="List granular deliverables (e.g. Organic Keyword mapping, SEO markup schema updates, continuous hosting maintenance...)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Specific Clauses / Riders</label>
                        <textarea
                          rows={4}
                          value={specificClauses}
                          onChange={(e) => setSpecificClauses(e.target.value)}
                          placeholder="Include custom compliance riders, unique termination clauses, or tailored requirements for this account..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left Column: Custom upload & Client name info */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          <span>Identity & Custom Upload</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Client / Brand Name <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Agreement Format File (.txt or .md)</label>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                          }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            const file = e.dataTransfer.files[0];
                            if (file) handleFileUpload(file);
                          }}
                          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                            isDragOver
                              ? "border-blue-500 bg-blue-50/40"
                              : uploadedFileName
                              ? "border-emerald-300 bg-emerald-50/10"
                              : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                          }`}
                        >
                          <input
                            type="file"
                            id="file-upload-input"
                            accept=".txt,.md,.markdown"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                          />
                          <label htmlFor="file-upload-input" className="cursor-pointer block space-y-3">
                            <Upload className={`w-10 h-10 mx-auto transition-all ${uploadedFileName ? "text-emerald-500" : "text-slate-400"}`} />
                            <div className="text-xs">
                              {uploadedFileName ? (
                                <span className="font-bold text-emerald-700 block">Uploaded File: {uploadedFileName}</span>
                              ) : (
                                <span className="text-slate-600 font-bold block">Drag & Drop file or Click to browse</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">Accepts raw standard text format and markdown (.txt, .md)</p>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Custom text content review/editor */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-600" />
                          <span>Format Document editor</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Document Text Content</label>
                        <textarea
                          rows={11}
                          required
                          value={uploadedFileText}
                          onChange={(e) => setUploadedFileText(e.target.value)}
                          placeholder="Drop/upload your custom text or markdown format layout to inspect or edit the content, or paste text directly here to build an agreement."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition leading-relaxed"
                        />
                      </div>
                    </div>
                  </>
                )}

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
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compile & Disclose Contract</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
