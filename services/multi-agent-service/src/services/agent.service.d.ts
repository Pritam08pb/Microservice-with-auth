export declare class AgentService {
    /**
     * Dispatches a user thought context to the background Kafka orchestration queue.
     */
    queueAgentTask(userId: string, prompt: string): Promise<string>;
}
export declare const agentService: AgentService;
//# sourceMappingURL=agent.service.d.ts.map