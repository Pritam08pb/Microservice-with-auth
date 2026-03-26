import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { ChatOllama } from "@langchain/ollama";
import { logger } from "../utils/logger";
import { getIo } from "../sockets/socket.manager";
import { searchUserContext } from "../rag/local.embeddings";
import { prisma } from "../config/prisma";

// We define the semantic state that persists across the Agent loop
export const AgentState = Annotation.Root({
  userId: Annotation<string>(),
  taskPrompt: Annotation<string>(),
  ragContext: Annotation<string[]>( { reducer: (state, update) => state.concat(update), default: () => [] } ),
  finalDraft: Annotation<string>(),
  routingDecision: Annotation<"USE_RAG" | "USE_CLOUD" | "USE_LOCAL">()
});
 
// Configure the Hybrid Models
const cloudModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || "mock_key",
  model: "llama3-8b-8192", // Fast Llama 3 on Groq
});

const localModel = new ChatOllama({
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  model: "llama3", // Assuming standard Llama 3 locally
});

// Node 1: The Router
// Decides which expert path the agent should take based on the prompt
const routingNode = async (state: typeof AgentState.State) => {
  logger.info(`[Router] Analyzing prompt: ${state.taskPrompt}`);
  
  const systemPrompt = `You are a strict task router for a multi-agent system.
Based on the user's prompt, determine the domain execution context.
Respond with exactly one of the three following strings, with absolutely no other text:
- USE_RAG: If the prompt mentions "invoice", "document", "pdf", "find", or requires reading specific contextual emails/files.
- USE_CLOUD: If the prompt involves "complex", "summarize", "code", "analyze", or heavy logic.
- USE_LOCAL: For basic chat, greetings, or simple quick questions.`;

  let decision: typeof AgentState.State["routingDecision"] = "USE_LOCAL"; // Default fallback

  try {
    const res = await localModel.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: state.taskPrompt }
    ]);
    
    const output = res.content.toString().trim().toUpperCase();
    
    if (output === "USE_RAG" || output === "USE_CLOUD" || output === "USE_LOCAL") {
      decision = output;
      logger.info(`[Router] LLM Deterministic Route Selection: ${decision}`);
    } else {
      logger.warn(`[Router] LLM returned malformed route: ${output}. Defaulting to USE_LOCAL.`);
    }

  } catch (err: any) {
    logger.error(`[Router] Fatal LLM classification failure. Engaged LOCAL fallback routing.`, err.message);
  }

  return { routingDecision: decision };
};

// Node 2: Local Vector Database Search (RAG)
const ragNode = async (state: typeof AgentState.State) => {
  logger.info(`[RAG] Searching local embeddings for user: ${state.userId}`);
  try {
    const user = await prisma.user.findUnique({ where: { id: state.userId } });
    
    if (!user || (!user.activeDocumentId && !user.isEmailEnabled)) {
      return { ragContext: ["Notice: The user has not enabled any active documents or email tracking in their dashboard."] };
    }

    let contextResults: string[] = [];

    // Evaluate active Document vectors
    if (user.activeDocumentId) {
      const activeDoc = await prisma.document.findUnique({ where: { id: user.activeDocumentId } });
      if (activeDoc) {
        // Technically this should be scoped tightly to the activeDoc.filename vector prefix
        const docContext = await searchUserContext(state.userId, state.taskPrompt);
        contextResults.push(...docContext);
      }
    }

    // Evaluate connected Email plugin context
    if (user.isEmailEnabled) {
      contextResults.push("System Notice: Email Plugin is enabled. (Mocked Email Context: User has a 3 PM meeting).");
    }

    if (contextResults.length === 0) {
      contextResults.push("No relevant contextual information discovered in the active sources.");
    }

    return { ragContext: contextResults };
  } catch (error: any) {
    logger.error(`[RAG] Vector Search Failed`, error.message);
    return { ragContext: ["Notice: Unable to retrieve documents at this time."] };
  }
};

// Node 3: The Drafting Engine (Executes the actual LLM)
const draftingNode = async (state: typeof AgentState.State) => {
  logger.info(`[Drafter] Generating response using context array length: ${state.ragContext.length}`);
  
  const ctx = state.ragContext.join("\n");
  const systemPrompt = `You are an AI assistant. Context: ${ctx}`;
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: state.taskPrompt }
  ];

  let resultString = "";

  try {
    if (state.routingDecision === "USE_LOCAL" || state.routingDecision === "USE_RAG") {
      // Local execution to save costs
      const res = await localModel.invoke(messages);
      resultString = res.content.toString();
    } else {
      // Cloud burst execution for high-speed reasoning
      const res = await cloudModel.invoke(messages);
      resultString = res.content.toString();
    }
  } catch (err: any) {
    logger.error("LLM Execution Failed", err.message);
    resultString = "Agent encountered an error executing the LLM.";
  }

  return { finalDraft: resultString };
};

// --- Compile the LangGraph ---
const workflow = new StateGraph(AgentState)
  .addNode("router", routingNode)
  .addNode("rag", ragNode)
  .addNode("drafter", draftingNode)
  
  .addEdge(START, "router")
  
  // Conditional edges based on the Router's decision
  .addConditionalEdges("router", (state) => {
    if (state.routingDecision === "USE_RAG") return "rag";
    return "drafter"; // skip straight to drafting if no RAG needed
  }, {
    "rag": "rag",
    "drafter": "drafter"
  })

  .addEdge("rag", "drafter") // RAG always flows to Drafter
  .addEdge("drafter", END);

export const MultiAgentBrain = workflow.compile();
