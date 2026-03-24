import { Kafka, Producer, Consumer } from "kafkajs";
import { logger } from "../utils/logger";

// Standard ENV fallback or proper config
const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";

const kafka = new Kafka({
  clientId: "multi-agent-service",
  brokers: [KAFKA_BROKER],
});

let producer: Producer;
let consumer: Consumer;

export const initKafka = async () => {
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
    logger.info("📡 Kafka Topic 'agent-tasks' is ready.");

    producer = kafka.producer();
    await producer.connect();
    logger.info("📡 Kafka Producer connected.");

    consumer = kafka.consumer({ groupId: "ai-agent-workers" });
    await consumer.connect();
    logger.info("📡 Kafka Consumer connected to group: ai-agent-workers");

    // Start listening right away to the agent tasks
    await consumer.subscribe({ topic: "agent-tasks", fromBeginning: true });
    
    // We export the run mechanism so the worker can attach its LangGraph logic
  } catch (err) {
    logger.error("Failed to connect to Kafka", err);
  }
};

export const getKafkaProducer = () => producer;
export const getKafkaConsumer = () => consumer;

// Push a new thought onto the Queue
export const publishAgentTask = async (userId: string, prompt: string) => {
  if (!producer) throw new Error("Kafka Producer offline");

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
