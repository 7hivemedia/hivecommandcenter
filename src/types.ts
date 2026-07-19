export interface Client {
  id: string;
  userId?: string;
  name: string;
  mail: string;
  phone: string;
  address: string;
  services: string;
  document: string;
  usernames: string;
  passwords: string;
  website: string;
  paymentPlan: string;
  noteKey: string;
  onboardedAt: string;
  status: "active" | "pending" | "completed";
  logoUrl?: string;
  
  // Multi-Agent Pipeline Status
  auditStatus: "idle" | "running" | "completed" | "failed";
  auditProgress: number; // 0 to 100
  activeAgentIndex: number; // -1 if not running
  
  // Outputs from each individual agent stage
  agentOutputs?: {
    main?: string;
    reviewer?: string;
    researcher?: string;
    seo?: string;
    aeo?: string;
  };
}

export interface Agreement {
  id: string;
  userId?: string;
  category: "Services Agreement" | "WAAS Agreement" | "Other";
  clientName: string;
  clientEmail: string;
  website: string;
  servicesScope: string;
  paymentTerms: string;
  duration: string;
  specificClauses: string;
  draftContent: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  role: "Director" | "Reviewer" | "Researcher" | "SEO" | "AEO";
  description: string;
  avatar: string;
  status: "idle" | "processing" | "success" | "alert";
  systemInstructions: string;
}

export interface ChatMessage {
  id: string;
  userId?: string;
  role: "user" | "model";
  sender: string;
  text: string;
  timestamp: string;
}

export interface SystemLog {
  id: string;
  userId?: string;
  timestamp: string;
  source: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "agent";
}

export interface Service {
  id: string;
  name: string;
  category: "AEO Optimization" | "Web Development" | "Organic Search Growth" | "Content & Copywriting" | "Other";
  price: string;
  description: string;
  deliverables: string[];
  isCustom?: boolean;
}

export interface AgentTask {
  id: string;
  userId?: string;
  title: string;
  clientName: string;
  agentRole: "Director" | "Reviewer" | "Researcher" | "SEO" | "AEO";
  agentName: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  description: string;
  currentStep?: string;
  dispatchedAt: string;
}

export interface RetainerPlan {
  id: string;
  userId?: string;
  name: string;
  price: string;
}


