import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI server-side with user-agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// API: Check system health
app.get("/api/health", (req, res) => {
  res.json({ status: "all systems operational", timestamp: new Date().toISOString() });
});

// API: Live Multi-Agent Pipeline Analysis by Stage
app.post("/api/analyze/stage", async (req, res) => {
  const { stage, client } = req.body;

  if (!client) {
    return res.status(400).json({ error: "Client profile is required for analysis." });
  }

  const { name, website, services, noteKey, paymentPlan } = client;

  // Choose system instructions and prompt depending on the agent stage
  let systemInstruction = "";
  let prompt = "";

  try {
    switch (stage) {
      case "main":
        systemInstruction = 
          "You are the Director Agent (Main Agent) at 7HIVE MEDIA+ (a high-end marketing & media agency). " +
          "Your role is to receive the onboarded client's raw profile data, digest it, and coordinate " +
          "the operational dispatch. Create a clear agency briefing, outline the core objectives for the client, " +
          "and assign specific target goals for the Reviewer, Researcher, SEO, and AEO agents.";
        prompt = `Onboard new client profile:
Client Name: ${name}
Website: ${website}
Services Requested: ${services}
Payment Tier/Plan: ${paymentPlan}
Internal Notes: ${noteKey}

Generate a concise, high-impact director briefing that summarizes the client's fit, agency launch tasks, and dispatch instructions. Keep it professional and styled with markdown headings.`;
        break;

      case "reviewer":
        systemInstruction =
          "You are the Brand Reviewer Agent at 7HIVE MEDIA+. Your role is to audit the client's current digital " +
          "identity, website concept, and social media positioning. You analyze standard brand alignment, " +
          "competitive advantage, and gaps. Be highly analytical, constructive, and forward-thinking.";
        prompt = `Conduct digital presence review for:
Brand Name: ${name}
Website Concept: ${website}
Services Selected: ${services}

Provide a digital identity audit. Detail:
1. Initial Brand Positioning Analysis
2. Digital Presence Gap Analysis
3. Core Digital Alignment Suggestions (specifically matching their services: ${services})`;
        break;

      case "researcher":
        systemInstruction =
          "You are the Lead Content Researcher at 7HIVE MEDIA+. Your role is to find content hooks, target " +
          "demographics, and high-impact media strategies. You create specific content ideas that drive brand authority.";
        prompt = `Create content & audience research for:
Brand Name: ${name}
Website/Niche: ${website}
Core Services: ${services}

Provide a brief Content & Audience Blueprint:
1. High-Value Target Demographic Personas
2. Three Viral-Ready Content Hooks & Creative Copy Angles
3. A 30-Day Content Distribution Strategy skeleton`;
        break;

      case "seo":
        systemInstruction =
          "You are the SEO Strategy Agent at 7HIVE MEDIA+. Your role is to formulate custom search engine " +
          "optimization plans, keyword selection parameters, on-page optimization checklists, and local/national authority blueprints.";
        prompt = `Formulate organic SEO blueprint for:
Brand Name: ${name}
Website: ${website}
Core Offerings: ${services}

Provide a highly actionable SEO Checklist containing:
1. Primary and LSI Keyword Niche Parameters
2. On-Page Structure & Meta-Title/Description formulas
3. Niche-specific link-building & content clustering strategies`;
        break;

      case "aeo":
        systemInstruction =
          "You are the Answer Engine Optimization (AEO) Agent at 7HIVE MEDIA+. Your role is to prepare " +
          "the client's digital footprint so that modern LLM search engines (Gemini, ChatGPT, Claude, Perplexity, Copilot) " +
          "cite and recommend them in natural language queries. This is advanced future-ready optimization.";
        prompt = `Formulate AEO (AI Search Engine Optimization) blueprint for:
Brand Name: ${name}
Target Market Context: ${services}
Digital Footprint: ${website}

Provide an AEO Strategy including:
1. Citations & Knowledge Graph Positioning
2. Structured Q&A/FAQ schemas to feed AI scrapers
3. Strategy to get listed on conversational recommendation engines`;
        break;

      default:
        return res.status(400).json({ error: `Invalid stage: ${stage}` });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const resultText = response.text || "Failed to generate analysis.";
    res.json({ output: resultText });
  } catch (err: any) {
    console.error("Gemini stage analysis failed:", err);
    res.status(500).json({ error: err.message || "Failed to run agent analysis stage." });
  }
});

// API: Multi-Agent Command / Chat Console
app.post("/api/chat", async (req, res) => {
  const { message, history, activeAgent } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Map active agent to specific persona instructions
  let systemInstruction = "You are an AI Agent of the 7HIVE MEDIA+ network.";
  if (activeAgent === "Director") {
    systemInstruction = 
      "You are the Director Agent (Main Agent) at 7HIVE MEDIA+ marketing agency. " +
      "You command and orchestrate all other agents (Reviewer, Researcher, SEO, AEO). " +
      "Answer questions about client operations, research, agency tasks, and command execution. " +
      "Keep the tone sharp, authoritative, and helpful, like an advanced cybernetic AI coordinator.";
  } else if (activeAgent === "Reviewer") {
    systemInstruction = 
      "You are the Brand Reviewer Agent at 7HIVE MEDIA+. You analyze brand positioning, website UI/UX, " +
      "market alignment, and digital presence. Answer in a precise, diagnostic, and marketing-focused tone.";
  } else if (activeAgent === "Researcher") {
    systemInstruction = 
      "You are the Lead Content Researcher Agent at 7HIVE MEDIA+. You specialize in social media trends, viral hooks, " +
      "target demographics, and campaign ideation. Answer with creative energy, specific examples, and tactical hooks.";
  } else if (activeAgent === "SEO") {
    systemInstruction = 
      "You are the SEO Strategy Agent at 7HIVE MEDIA+. You specialize in Google rankings, keyword blueprints, schema markup, " +
      "and content clustering. Answer with precise organic parameters and actionable checklists.";
  } else if (activeAgent === "AEO") {
    systemInstruction = 
      "You are the Answer Engine Optimization (AEO) Agent at 7HIVE MEDIA+. You specialize in making brands authoritative " +
      "for AI Search Engines like Gemini, ChatGPT, and Perplexity. Answer with futuristic advice on citation building, " +
      "knowledge graph positioning, and natural language optimization.";
  }

  try {
    // Format chat history for Gemini API contents parameter
    const formattedContents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        formattedContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }
    // Add current user message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "No response received from agent.";
    res.json({ reply });
  } catch (err: any) {
    console.error("Gemini chat failed:", err);
    res.status(500).json({ error: err.message || "Failed to communicate with agent." });
  }
});

// Boot or Serve client SPA
if (process.env.NODE_ENV !== "production") {
  // Vite dev mode
  import("vite").then(async (viteModule) => {
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Fallback for SPA routing in dev
    app.get("*", (req, res, next) => {
      vite.middlewares(req, res, next);
    });
  });
} else {
  // Production static build assets
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`7HIVE Operations Server listening on http://0.0.0.0:${PORT}`);
});
