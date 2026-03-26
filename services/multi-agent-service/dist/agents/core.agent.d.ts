export declare const AgentState: import("@langchain/langgraph").AnnotationRoot<{
    userId: import("@langchain/langgraph").LastValue<string>;
    taskPrompt: import("@langchain/langgraph").LastValue<string>;
    ragContext: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
    finalDraft: import("@langchain/langgraph").LastValue<string>;
    routingDecision: import("@langchain/langgraph").LastValue<"USE_RAG" | "USE_CLOUD" | "USE_LOCAL">;
}>;
export declare const MultiAgentBrain: import("@langchain/langgraph").CompiledStateGraph<{
    userId: string;
    taskPrompt: string;
    ragContext: string[];
    finalDraft: string;
    routingDecision: "USE_RAG" | "USE_CLOUD" | "USE_LOCAL";
}, {
    userId?: string;
    taskPrompt?: string;
    ragContext?: string[] | import("@langchain/langgraph").OverwriteValue<string[]>;
    finalDraft?: string;
    routingDecision?: "USE_RAG" | "USE_CLOUD" | "USE_LOCAL";
}, "__start__" | "router" | "rag" | "drafter", {
    userId: import("@langchain/langgraph").LastValue<string>;
    taskPrompt: import("@langchain/langgraph").LastValue<string>;
    ragContext: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
    finalDraft: import("@langchain/langgraph").LastValue<string>;
    routingDecision: import("@langchain/langgraph").LastValue<"USE_RAG" | "USE_CLOUD" | "USE_LOCAL">;
}, {
    userId: import("@langchain/langgraph").LastValue<string>;
    taskPrompt: import("@langchain/langgraph").LastValue<string>;
    ragContext: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
    finalDraft: import("@langchain/langgraph").LastValue<string>;
    routingDecision: import("@langchain/langgraph").LastValue<"USE_RAG" | "USE_CLOUD" | "USE_LOCAL">;
}, import("@langchain/langgraph").StateDefinition, {
    router: {
        routingDecision: "USE_RAG" | "USE_CLOUD" | "USE_LOCAL";
    };
    rag: {
        ragContext: string[];
    };
    drafter: {
        finalDraft: string;
    };
}, unknown, unknown>;
//# sourceMappingURL=core.agent.d.ts.map