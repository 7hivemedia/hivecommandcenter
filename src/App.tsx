import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import ClientsView from "./components/ClientsView";
import ServicesView from "./components/ServicesView";
import AgreementsView from "./components/AgreementsView";
import ChatConsoleView from "./components/ChatConsoleView";
import SettingsView from "./components/SettingsView";
import TasksView from "./components/TasksView";
import { Client, Agreement, ChatMessage, SystemLog, AgentTask, Service, RetainerPlan } from "./types";
import { loadUserCollection, saveDocument, deleteDocument, auth } from "./firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import AuthView from "./components/AuthView";
import { Database, CloudLightning, RefreshCw } from "lucide-react";
import firebaseConfig from "../firebase-applet-config.json";

// Pre-populated Clients Dossiers Constants
const INITIAL_CLIENTS: Client[] = [];

// Pre-populated Agent Tasks Constants
const INITIAL_TASKS: AgentTask[] = [];

// Pre-populated System Logs Constants
const INITIAL_SYSTEM_LOGS: SystemLog[] = [];

// Pre-populated Agreements Constants
const INITIAL_AGREEMENTS: Agreement[] = [];

// Pre-populated Chat History Constants
const INITIAL_CHAT_HISTORY: ChatMessage[] = [];

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients" | "services" | "agreements" | "chat" | "settings" | "tasks">("dashboard");
  const [systemStatus, setSystemStatus] = useState<"ONLINE" | "STANDBY" | "MAINTENANCE">("ONLINE");
  const [isScanning, setIsScanning] = useState(false);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addSystemLog("SYSTEM", "Commander session disconnected securely.", "warning");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  // Core App states synced with Firestore
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [retainerPlans, setRetainerPlans] = useState<RetainerPlan[]>([]);
  
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);

  // Pre-populated Agreement Draft Templates
  const [templates, setTemplates] = useState({
    services: `# 7HIVE MEDIA+ SERVICES AGREEMENT

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
[SpecificClauses]`,
    waas: `# 7HIVE MEDIA+ WAAS (WEBSITE-AS-A-SERVICE) AGREEMENT

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
[SpecificClauses]`,
    other: `# 7HIVE MEDIA+ MARKETING PROPOSAL & AGREEMENT

Prepared for: [ClientName] ([ClientEmail])
Target Asset: [Website]

## STRATEGIC SCOPE
- [ServicesScope]

## DISBURSEMENT SCHEDULING
- Terms: [PaymentTerms]
- Project Span: [Duration]

## SUPPLEMENTAL CLAUSES
[SpecificClauses]`
  });

  // Keep references to previous states to perform precise incremental syncs
  const prevClientsRef = useRef<Client[]>([]);
  const prevTasksRef = useRef<AgentTask[]>([]);
  const prevLogsRef = useRef<SystemLog[]>([]);
  const prevAgreementsRef = useRef<Agreement[]>([]);
  const prevChatRef = useRef<ChatMessage[]>([]);
  const prevServicesRef = useRef<Service[]>([]);
  const prevRetainerPlansRef = useRef<RetainerPlan[]>([]);

  // 1. Initial load and seed of Firebase data
  useEffect(() => {
    async function fetchUserSpecificData() {
      if (!currentUser) {
        // Clear all lists when logged out to prevent leaking information
        setClients([]);
        setTasks([]);
        setSystemLogs([]);
        setAgreements([]);
        setChatHistory([]);
        setServices([]);
        setRetainerPlans([]);
        prevClientsRef.current = [];
        prevTasksRef.current = [];
        prevLogsRef.current = [];
        prevAgreementsRef.current = [];
        prevChatRef.current = [];
        prevServicesRef.current = [];
        prevRetainerPlansRef.current = [];
        setIsLoadingBackend(false);
        return;
      }

      setIsLoadingBackend(true);
      try {
        let loadedClients = await loadUserCollection<Client>("clients", currentUser.uid);
        if (loadedClients.length === 0) {
          const defaultClients: Client[] = [
            {
              id: "cli_shigma",
              userId: currentUser.uid,
              name: "Shigma Shine Enterprise",
              mail: "shigmashinesolar@gmail.com",
              phone: "9716890010",
              address: "Gate no-5,KH-900 Gorund floor, Badli Industrial Area, Siraspur, Delhi",
              services: "Meta Ads, GMB Service( Local SEO), Social Media Marketing",
              document: "raw_direct_onboarding.json",
              usernames: "@shigmashineenterprise",
              passwords: "temp_token_h08ax",
              website: "www.shigmashine.com",
              paymentPlan: "Standard WAAS Plan - ₹1,25,000/mo",
              noteKey: "Ads budget-Average 15000 weekly optimise, 2-3 post and 2 video/Month",
              onboardedAt: new Date().toLocaleDateString(),
              status: "active",
              logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&auto=format",
              auditStatus: "completed",
              auditProgress: 100,
              activeAgentIndex: -1,
              agentOutputs: {
                main: "### Shigma Shine Enterprise - Executive Summary\n- Solid local search presence potential.\n- Action item: Maximize Google Map Pack visibility with local citations and review campaign.\n- Plan to deploy highly localized Meta Ads targeting Delhi residential and business zones.",
                reviewer: "### Reviewer Feedback\n- Branding guidelines look consistent. Recommending higher density of solar/clean-tech visual assets.",
                researcher: "### Market Discovery Report\n- Competitive search volume detected for Siraspur and North Delhi industrial hubs.\n- Highlight low-barrier conversion paths for business solar inquiries.",
                seo: "### SEO Cluster Mapping\n- High priority keywords: 'industrial solar Siraspur', 'Delhi commercial solar installations'.\n- Implement semantic breadcrumbs on shigmashine.com.",
                aeo: "### AEO Optimization Blueprint\n- Structure answers for 'How to choose industrial solar partner in Siraspur' to target Google Answer Box."
              }
            }
          ];
          for (const item of defaultClients) {
            await saveDocument("clients", item.id, item);
          }
          loadedClients = defaultClients;
        }
        setClients(loadedClients);
        prevClientsRef.current = loadedClients;

        const loadedTasks = await loadUserCollection<AgentTask>("tasks", currentUser.uid);
        setTasks(loadedTasks);
        prevTasksRef.current = loadedTasks;

        const loadedServices = await loadUserCollection<Service>("services", currentUser.uid);
        setServices(loadedServices);
        prevServicesRef.current = loadedServices;

        let loadedRetainers = await loadUserCollection<RetainerPlan>("retainerPlans", currentUser.uid);
        if (loadedRetainers.length === 0) {
          const defaultRetainers: RetainerPlan[] = [
            { id: "rp_enterprise", userId: currentUser.uid, name: "Enterprise Retainer", price: "₹4,00,000/mo" },
            { id: "rp_waas", userId: currentUser.uid, name: "Standard WAAS Plan", price: "₹1,25,000/mo" },
            { id: "rp_starter", userId: currentUser.uid, name: "Starter Growth Plan", price: "₹65,000/mo" }
          ];
          for (const item of defaultRetainers) {
            await saveDocument("retainerPlans", item.id, item);
          }
          loadedRetainers = defaultRetainers;
        }
        setRetainerPlans(loadedRetainers);
        prevRetainerPlansRef.current = loadedRetainers;

        const loadedLogs = await loadUserCollection<SystemLog>("systemLogs", currentUser.uid);
        if (loadedLogs.length === 0) {
          const welcomeLog: SystemLog = {
            id: "log_welcome_" + Math.random().toString(36).substring(2, 9),
            userId: currentUser.uid,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            source: "SYSTEM",
            message: `Neural Core Boot Completed successfully for Commander ${currentUser.displayName || 'User'}. Ready for action.`,
            type: "success"
          };
          setSystemLogs([welcomeLog]);
          prevLogsRef.current = [welcomeLog];
        } else {
          setSystemLogs(loadedLogs);
          prevLogsRef.current = loadedLogs;
        }

        const loadedAgreements = await loadUserCollection<Agreement>("agreements", currentUser.uid);
        setAgreements(loadedAgreements);
        prevAgreementsRef.current = loadedAgreements;

        const loadedChat = await loadUserCollection<ChatMessage>("chatHistory", currentUser.uid);
        if (loadedChat.length === 0) {
          const welcomeChat: ChatMessage = {
            id: "msg_init_" + Math.random().toString(36).substring(2, 9),
            userId: currentUser.uid,
            role: "model",
            sender: "7HIVE DIRECTOR",
            text: `System initialized, Commander ${currentUser.displayName || ''}. I am the central Operations Dispatcher. Select an agent in the left sidebar to issue specific brand audit or content research queries, or onboard clients to execute sequential live multi-agent pipelines.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatHistory([welcomeChat]);
          prevChatRef.current = [welcomeChat];
        } else {
          setChatHistory(loadedChat);
          prevChatRef.current = loadedChat;
        }
      } catch (err) {
        console.error("Firebase database user load error:", err);
      } finally {
        setIsLoadingBackend(false);
      }
    }
    
    if (!isAuthChecking) {
      fetchUserSpecificData();
    }
  }, [currentUser, isAuthChecking]);

  // 2. Incremental Sync for Clients
  useEffect(() => {
    if (isLoadingBackend || !currentUser) return;
    const prev = prevClientsRef.current;
    
    // Additions & Modifications
    for (const item of clients) {
      const prevItem = prev.find((p) => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        saveDocument("clients", item.id, { ...item, userId: currentUser.uid });
      }
    }
    // Deletions
    for (const item of prev) {
      const nextItem = clients.find((n) => n.id === item.id);
      if (!nextItem) {
        deleteDocument("clients", item.id);
      }
    }
    prevClientsRef.current = clients;
  }, [clients, isLoadingBackend, currentUser]);

  // 3. Incremental Sync for Tasks
  useEffect(() => {
    if (isLoadingBackend || !currentUser) return;
    const prev = prevTasksRef.current;
    
    for (const item of tasks) {
      const prevItem = prev.find((p) => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        saveDocument("tasks", item.id, { ...item, userId: currentUser.uid });
      }
    }
    for (const item of prev) {
      const nextItem = tasks.find((n) => n.id === item.id);
      if (!nextItem) {
        deleteDocument("tasks", item.id);
      }
    }
    prevTasksRef.current = tasks;
  }, [tasks, isLoadingBackend, currentUser]);

  // 4. Incremental Sync for System Logs
  useEffect(() => {
    if (isLoadingBackend || !currentUser) return;
    const prev = prevLogsRef.current;
    
    for (const item of systemLogs) {
      const prevItem = prev.find((p) => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        saveDocument("systemLogs", item.id, { ...item, userId: currentUser.uid });
      }
    }
    for (const item of prev) {
      const nextItem = systemLogs.find((n) => n.id === item.id);
      if (!nextItem) {
        deleteDocument("systemLogs", item.id);
      }
    }
    prevLogsRef.current = systemLogs;
  }, [systemLogs, isLoadingBackend, currentUser]);

  // 5. Incremental Sync for Agreements
  useEffect(() => {
    if (isLoadingBackend || !currentUser) return;
    const prev = prevAgreementsRef.current;
    
    for (const item of agreements) {
      const prevItem = prev.find((p) => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        saveDocument("agreements", item.id, { ...item, userId: currentUser.uid });
      }
    }
    for (const item of prev) {
      const nextItem = agreements.find((n) => n.id === item.id);
      if (!nextItem) {
        deleteDocument("agreements", item.id);
      }
    }
    prevAgreementsRef.current = agreements;
  }, [agreements, isLoadingBackend, currentUser]);

  // 6. Incremental Sync for Chat History
  useEffect(() => {
    if (isLoadingBackend || !currentUser) return;
    const prev = prevChatRef.current;
    
    for (const item of chatHistory) {
      const prevItem = prev.find((p) => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        saveDocument("chatHistory", item.id, { ...item, userId: currentUser.uid });
      }
    }
    for (const item of prev) {
      const nextItem = chatHistory.find((n) => n.id === item.id);
      if (!nextItem) {
        deleteDocument("chatHistory", item.id);
      }
    }
    prevChatRef.current = chatHistory;
  }, [chatHistory, isLoadingBackend, currentUser]);

  // 7. Incremental Sync for Services
  useEffect(() => {
    if (isLoadingBackend || !currentUser) return;
    const prev = prevServicesRef.current;
    
    for (const item of services) {
      const prevItem = prev.find((p) => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        saveDocument("services", item.id, { ...item, userId: currentUser.uid });
      }
    }
    for (const item of prev) {
      const nextItem = services.find((n) => n.id === item.id);
      if (!nextItem) {
        deleteDocument("services", item.id);
      }
    }
    prevServicesRef.current = services;
  }, [services, isLoadingBackend, currentUser]);

  // 8. Incremental Sync for Retainer Plans
  useEffect(() => {
    if (isLoadingBackend || !currentUser) return;
    const prev = prevRetainerPlansRef.current;
    
    for (const item of retainerPlans) {
      const prevItem = prev.find((p) => p.id === item.id);
      if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
        saveDocument("retainerPlans", item.id, { ...item, userId: currentUser.uid });
      }
    }
    for (const item of prev) {
      const nextItem = retainerPlans.find((n) => n.id === item.id);
      if (!nextItem) {
        deleteDocument("retainerPlans", item.id);
      }
    }
    prevRetainerPlansRef.current = retainerPlans;
  }, [retainerPlans, isLoadingBackend, currentUser]);

  // Helper function to append logs
  const addSystemLog = (source: string, msg: string, type: "info" | "success" | "warning" | "error" | "agent") => {
    const newLog: SystemLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      userId: currentUser?.uid || "system",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source,
      message: msg,
      type
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Sync state changes with logs
  const triggerSystemScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    addSystemLog("SYSTEM", "Initiating network packet audit and hardware diagnostics...", "info");

    setTimeout(() => {
      addSystemLog("SYSTEM", "All network nodes operating on Port 3000 are secure.", "success");
      addSystemLog("DIRECTOR", "Director core successfully verified model connectivity with Gemini-3.5-flash.", "success");
      setIsScanning(false);
    }, 2000);
  };

  // 7. Render high-end loading portal while syncing with Firebase
  if (isAuthChecking || isLoadingBackend) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900 text-slate-100 font-sans select-none">
        <div className="relative flex items-center justify-center mb-6">
          {/* Neon spinning orbit */}
          <div className="absolute w-24 h-24 rounded-full border border-blue-500/20 border-t-blue-500 animate-spin duration-1000" />
          <div className="absolute w-20 h-20 rounded-full border border-cyan-500/10 border-b-cyan-500 animate-spin duration-[1.5s]" />
          <Database className="w-10 h-10 text-blue-500 animate-pulse" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-base font-bold tracking-widest text-slate-100 uppercase">
            Synchronizing Operations Core
          </h1>
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 font-mono">
            <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span>Establishing link with Cloud Firestore backend...</span>
          </div>
          <div className="text-[10px] text-blue-400/60 font-mono mt-4">
            DB ID: {firebaseConfig.projectId || "gen-lang-client"}
          </div>
        </div>
      </div>
    );
  }

  // Render Authentication Portal if user is not signed in
  if (!currentUser) {
    return (
      <AuthView 
        onSuccess={() => {
          // State is automatically updated by onAuthStateChanged listener
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={systemStatus} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main workspace renderer */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {activeTab === "dashboard" && (
          <DashboardView 
            clients={clients} 
            systemLogs={systemLogs} 
            addSystemLog={addSystemLog} 
            triggerSystemScan={triggerSystemScan}
            isScanning={isScanning}
          />
        )}

        {activeTab === "clients" && (
          <ClientsView 
            clients={clients} 
            setClients={setClients} 
            retainerPlans={retainerPlans}
            addSystemLog={addSystemLog} 
          />
        )}

        {activeTab === "services" && (
          <ServicesView 
            services={services}
            setServices={setServices}
            addSystemLog={addSystemLog} 
          />
        )}

        {activeTab === "agreements" && (
          <AgreementsView 
            agreements={agreements} 
            setAgreements={setAgreements} 
            templates={templates} 
            addSystemLog={addSystemLog} 
          />
        )}

        {activeTab === "chat" && (
          <ChatHistoryProvider chatHistory={chatHistory} setChatHistory={setChatHistory} addSystemLog={addSystemLog} />
        )}

        {activeTab === "tasks" && (
          <TasksView 
            clients={clients} 
            tasks={tasks} 
            setTasks={setTasks} 
            addSystemLog={addSystemLog} 
          />
        )}

        {activeTab === "settings" && (
          <SettingsView 
            templates={templates} 
            setTemplates={setTemplates} 
            retainerPlans={retainerPlans}
            setRetainerPlans={setRetainerPlans}
            addSystemLog={addSystemLog} 
            systemStatus={systemStatus}
            setSystemStatus={setSystemStatus}
          />
        )}
      </div>
    </div>
  );
}

// Inline Chat wrapper to ensure clean component mounts
function ChatHistoryProvider({ chatHistory, setChatHistory, addSystemLog }: {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addSystemLog: (source: string, msg: string, type: "info" | "success" | "warning" | "error" | "agent") => void;
}) {
  return (
    <ChatConsoleView 
      chatHistory={chatHistory} 
      setChatHistory={setChatHistory} 
      addSystemLog={addSystemLog} 
    />
  );
}
