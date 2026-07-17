import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Terminal, 
  Shield, 
  Cpu, 
  User, 
  Loader2, 
  HelpCircle,
  Code,
  Globe,
  Radio,
  Sparkles
} from "lucide-react";
import { ChatMessage, Agent } from "../types";

interface ChatConsoleViewProps {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addSystemLog: (source: string, msg: string, type: "info" | "success" | "warning" | "error" | "agent") => void;
}

export default function ChatConsoleView({ 
  chatHistory, 
  setChatHistory, 
  addSystemLog 
}: ChatConsoleViewProps) {
  const [activeAgent, setActiveAgent] = useState<"Director" | "Reviewer" | "Researcher" | "SEO" | "AEO">("Director");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when history updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const agents: Agent[] = [
    {
      id: "ag_dir",
      name: "Director Agent",
      role: "Director",
      description: "Coordinates marketing pipelines, assigns client audits, and directs campaign launches.",
      avatar: "01",
      status: "idle",
      systemInstructions: ""
    },
    {
      id: "ag_rev",
      name: "Brand Reviewer Agent",
      role: "Reviewer",
      description: "Audits digital positioning, UX conceptual gaps, and competitor alignment profiles.",
      avatar: "02",
      status: "idle",
      systemInstructions: ""
    },
    {
      id: "ag_res",
      name: "Content Researcher Agent",
      role: "Researcher",
      description: "Discovers target audience insights, viral copywriting hooks, and social distribution ideas.",
      avatar: "03",
      status: "idle",
      systemInstructions: ""
    },
    {
      id: "ag_seo",
      name: "SEO Strategist Agent",
      role: "SEO",
      description: "Optimizes semantic on-page clusters, organic keyword structures, and search crawl parameters.",
      avatar: "04",
      status: "idle",
      systemInstructions: ""
    },
    {
      id: "ag_aeo",
      name: "AEO Optimizer Agent",
      role: "AEO",
      description: "Structures QA schemas, brand citations, and public business graphs for AI query engine answers.",
      avatar: "05",
      status: "idle",
      systemInstructions: ""
    }
  ];

  const currentAgent = agents.find(a => a.role === activeAgent)!;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      role: "user",
      sender: "Commander",
      text: userInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setUserInput("");
    setIsLoading(true);
    addSystemLog("COMMANDER", `Query delivered to ${currentAgent.name}: "${userMsg.text.substring(0, 35)}..."`, "info");

    try {
      // Proxy chat payload to server-side Gemini API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          activeAgent: activeAgent,
          // Extract last 10 messages for continuous context
          history: chatHistory.slice(-10).map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const agentMsg: ChatMessage = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        role: "model",
        sender: currentAgent.name,
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, agentMsg]);
      addSystemLog(currentAgent.role.toUpperCase(), `Report compiled and returned back to CRM interface.`, "success");
    } catch (err: any) {
      console.error("Agent chat failed:", err);
      addSystemLog(currentAgent.role.toUpperCase(), `Communication failure: ${err.message}`, "error");
      
      const errorMsg: ChatMessage = {
        id: "msg_err_" + Math.random().toString(36).substring(2, 9),
        role: "model",
        sender: currentAgent.name,
        text: `CRITICAL TELEMETRY ERROR: Failed to query Gemini Core. Reason: ${err.message || "Unknown proxy interruption."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPresetQuery = (preset: string) => {
    setUserInput(preset);
    addSystemLog("HUD", "Pre-loaded client query selected.", "info");
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* Top/Left Selector Column */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white select-none shrink-0">
        <div className="p-4 border-b border-slate-100">
          <span className="font-semibold text-[10px] tracking-wider text-slate-400 block uppercase">
            ACTIVE CORES DIRECTORY
          </span>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Toggle specific agent cores to route questions.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {agents.map((ag) => {
            const isSelected = ag.role === activeAgent;
            return (
              <div
                key={ag.id}
                onClick={() => {
                  setActiveAgent(ag.role);
                  addSystemLog("SYSTEM", `Communications routed to: ${ag.name}`, "info");
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                  isSelected 
                    ? "bg-blue-50 border-blue-200 text-blue-900 shadow-sm" 
                    : "bg-transparent border-transparent text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? "border-blue-500 bg-blue-100 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}>
                    {ag.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold block truncate">
                      {ag.name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase mt-0.5">
                      NODE ROLE: {ag.role}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-normal mt-2.5 font-medium">
                  {ag.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Communication Terminal */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Terminal Agent Header bar */}
        <div className="p-4 border-b border-slate-200 bg-white select-none flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              CHANNEL: [7HIVE_AGENT_LINK_{activeAgent.toUpperCase()}]
            </h3>
          </div>
          <span className="text-[9px] font-mono text-slate-400 font-semibold">MODEL ID: GEMINI-3.5-FLASH</span>
        </div>

        {/* Chat log displays */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Terminal className="w-8 h-8 text-slate-300 animate-pulse" />
              <div className="text-center space-y-1">
                <p className="font-semibold uppercase text-xs tracking-wider text-slate-500">
                  Awaiting Directives
                </p>
                <p className="text-[10px] text-slate-400 max-w-sm">
                  Query {currentAgent.name} using the text console below or click a template parameter shortcut:
                </p>
              </div>

              {/* Presets query tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4 max-w-lg">
                {[
                  "Draft a 3-step lead magnet hook for a dental clinic.",
                  "Outline critical local SEO checklist points.",
                  "What is Answer Engine Optimization (AEO) and why do we need it?",
                  "Define the Director Agent objectives for a marketing campaign."
                ].map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => loadPresetQuery(preset)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[10px] text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-all cursor-pointer shadow-sm"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {chatHistory.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div 
                    key={msg.id} 
                    className={`flex items-start space-x-3 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                        🤖
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl border p-4 text-xs leading-relaxed shadow-sm ${
                      isUser 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "bg-white border-slate-200 text-slate-700"
                    }`}>
                      <div className={`flex justify-between items-center text-[9px] mb-2 uppercase select-none border-b pb-1.5 ${
                        isUser ? "border-white/20 text-white/80" : "border-slate-100 text-slate-400 font-semibold"
                      }`}>
                        <span>{msg.sender}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className="whitespace-pre-wrap select-text">{msg.text}</div>
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex items-start space-x-3 justify-start">
                  <div className="w-8 h-8 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  </div>
                  <div className="max-w-[80%] rounded-xl border border-slate-150 bg-white p-4 text-xs text-slate-400 animate-pulse shadow-sm">
                    Querying central Gemini models pipeline...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input box form */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3 max-w-4xl mx-auto">
            <input 
              type="text" 
              disabled={isLoading}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={`Query ${currentAgent.name}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-40 cursor-pointer flex items-center space-x-2 shadow-md text-xs font-bold shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
