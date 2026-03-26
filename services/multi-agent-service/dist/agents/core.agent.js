"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiAgentBrain = exports.AgentState = void 0;
const langgraph_1 = require("@langchain/langgraph");
const groq_1 = require("@langchain/groq");
const ollama_1 = require("@langchain/ollama");
const logger_1 = require("../utils/logger");
const local_embeddings_1 = require("../rag/local.embeddings");
const prisma_1 = require("../config/prisma");
// We define the semantic state that persists across the Agent loop
exports.AgentState = langgraph_1.Annotation.Root({
    userId: (0, langgraph_1.Annotation)(),
    taskPrompt: (0, langgraph_1.Annotation)(),
    ragContext: (0, langgraph_1.Annotation)({ reducer: (state, update) => state.concat(update), default: () => [] }),
    finalDraft: (0, langgraph_1.Annotation)(),
    routingDecision: (0, langgraph_1.Annotation)()
});
// Configure the Hybrid Models
const cloudModel = new groq_1.ChatGroq({
    apiKey: process.env.GROQ_API_KEY || "mock_key",
    model: "llama3-8b-8192", // Fast Llama 3 on Groq
});
const localModel = new ollama_1.ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: "llama3", // Assuming standard Llama 3 locally
});
// Node 1: The Router
// Decides which expert path the agent should take based on the prompt
const routingNode = async (state) => {
    logger_1.logger.info(`[Router] Analyzing prompt: ${state.taskPrompt}`);
    const systemPrompt = `You are a strict task router for a multi-agent system.
Based on the user's prompt, determine the domain execution context.
Respond with exactly one of the three following strings, with absolutely no other text:
- USE_RAG: If the prompt mentions "invoice", "document", "pdf", "find", or requires reading specific contextual emails/files.
- USE_CLOUD: If the prompt involves "complex", "summarize", "code", "analyze", or heavy logic.
- USE_LOCAL: For basic chat, greetings, or simple quick questions.`;
    let decision = "USE_LOCAL"; // Default fallback
    try {
        const res = await localModel.invoke([
            { role: "system", content: systemPrompt },
            { role: "user", content: state.taskPrompt }
        ]);
        const output = res.content.toString().trim().toUpperCase();
        if (output === "USE_RAG" || output === "USE_CLOUD" || output === "USE_LOCAL") {
            decision = output;
            logger_1.logger.info(`[Router] LLM Deterministic Route Selection: ${decision}`);
        }
        else {
            logger_1.logger.warn(`[Router] LLM returned malformed route: ${output}. Defaulting to USE_LOCAL.`);
        }
    }
    catch (err) {
        logger_1.logger.error(`[Router] Fatal LLM classification failure. Engaged LOCAL fallback routing.`, err.message);
    }
    return { routingDecision: decision };
};
// Node 2: Local Vector Database Search (RAG)
const ragNode = async (state) => {
    logger_1.logger.info(`[RAG] Searching local embeddings for user: ${state.userId}`);
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: state.userId } });
        if (!user || (!user.activeDocumentId && !user.isEmailEnabled)) {
            return { ragContext: ["Notice: The user has not enabled any active documents or email tracking in their dashboard."] };
        }
        let contextResults = [];
        // Evaluate active Document vectors
        if (user.activeDocumentId) {
            const activeDoc = await prisma_1.prisma.document.findUnique({ where: { id: user.activeDocumentId } });
            if (activeDoc) {
                // Technically this should be scoped tightly to the activeDoc.filename vector prefix
                const docContext = await (0, local_embeddings_1.searchUserContext)(state.userId, state.taskPrompt);
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
    }
    catch (error) {
        logger_1.logger.error(`[RAG] Vector Search Failed`, error.message);
        return { ragContext: ["Notice: Unable to retrieve documents at this time."] };
    }
};
// Node 3: The Drafting Engine (Executes the actual LLM)
const draftingNode = async (state) => {
    logger_1.logger.info(`[Drafter] Generating response using context array length: ${state.ragContext.length}`);
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
        }
        else {
            // Cloud burst execution for high-speed reasoning
            const res = await cloudModel.invoke(messages);
            resultString = res.content.toString();
        }
    }
    catch (err) {
        logger_1.logger.error("LLM Execution Failed", err.message);
        resultString = "Agent encountered an error executing the LLM.";
    }
    return { finalDraft: resultString };
};
// --- Compile the LangGraph ---
const workflow = new langgraph_1.StateGraph(exports.AgentState)
    .addNode("router", routingNode)
    .addNode("rag", ragNode)
    .addNode("drafter", draftingNode)
    .addEdge(langgraph_1.START, "router")
    // Conditional edges based on the Router's decision
    .addConditionalEdges("router", (state) => {
    if (state.routingDecision === "USE_RAG")
        return "rag";
    return "drafter"; // skip straight to drafting if no RAG needed
}, {
    "rag": "rag",
    "drafter": "drafter"
})
    .addEdge("rag", "drafter") // RAG always flows to Drafter
    .addEdge("drafter", langgraph_1.END);
exports.MultiAgentBrain = workflow.compile();
//# sourceMappingURL=core.agent.js.map