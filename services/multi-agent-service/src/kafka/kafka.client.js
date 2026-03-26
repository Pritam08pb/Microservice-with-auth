"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishAgentTask = exports.getKafkaConsumer = exports.getKafkaProducer = exports.initKafka = void 0;
const kafkajs_1 = require("kafkajs");
const logger_1 = require("../utils/logger");
// Standard ENV fallback or proper config
const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const kafka = new kafkajs_1.Kafka({
    clientId: "multi-agent-service",
    brokers: [KAFKA_BROKER],
});
let producer;
let consumer;
const initKafka = async () => {
    try {
        const admin = kafka.admin();
        await admin.connect();
        // Create topic if it doesn't exist and wait for leader election
        await admin.createTopics({
            topics: [{
                    topic: "agent-tasks",
                }],
            waitForLeaders: true,
        });
        await admin.disconnect();
        logger_1.logger.info("📡 Kafka Topic 'agent-tasks' is ready.");
        producer = kafka.producer();
        await producer.connect();
        logger_1.logger.info("📡 Kafka Producer connected.");
        consumer = kafka.consumer({ groupId: "ai-agent-workers" });
        await consumer.connect();
        logger_1.logger.info("📡 Kafka Consumer connected to group: ai-agent-workers");
        // Start listening right away to the agent tasks
        await consumer.subscribe({ topic: "agent-tasks", fromBeginning: true });
        // We export the run mechanism so the worker can attach its LangGraph logic
    }
    catch (err) {
        logger_1.logger.error("Failed to connect to Kafka", err);
    }
};
exports.initKafka = initKafka;
const getKafkaProducer = () => producer;
exports.getKafkaProducer = getKafkaProducer;
const getKafkaConsumer = () => consumer;
exports.getKafkaConsumer = getKafkaConsumer;
// Push a new thought onto the Queue
const publishAgentTask = async (userId, prompt) => {
    if (!producer)
        throw new Error("Kafka Producer offline");
    const messageId = crypto.randomUUID();
    await producer.send({
        topic: "agent-tasks",
        messages: [
            {
                key: userId, // Keeps absolute order of thoughts for this specific user intact!
                value: JSON.stringify({ messageId, userId, prompt, timestamp: Date.now() }),
            },
        ],
    });
    return messageId;
};
exports.publishAgentTask = publishAgentTask;
//# sourceMappingURL=kafka.client.js.map