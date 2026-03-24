import { Producer, Consumer } from "kafkajs";
export declare const initKafka: () => Promise<void>;
export declare const getKafkaProducer: () => Producer;
export declare const getKafkaConsumer: () => Consumer;
export declare const publishAgentTask: (userId: string, prompt: string) => Promise<`${string}-${string}-${string}-${string}-${string}`>;
//# sourceMappingURL=kafka.client.d.ts.map