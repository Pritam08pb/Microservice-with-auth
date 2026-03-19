"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postgres_1 = require("../../../shared/database/postgres");
const redisClient_1 = require("../../../shared/redis/redisClient");
const mongo_1 = require("../../../shared/database/mongo");
const kafkaClient_1 = require("../../../shared/kafka/kafkaClient");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.json({
        service: "auth-service",
        status: "running",
    });
});
app.get("/infra-test", async (req, res) => {
    const status = {};
    try {
        const result = await postgres_1.postgres.query("SELECT NOW()");
        status.postgres = "connected";
        status.postgres_time = result.rows[0];
    }
    catch (err) {
        status.postgres = "failed";
    }
    try {
        await redisClient_1.redis.set("helpy_test", "ok");
        const value = await redisClient_1.redis.get("helpy_test");
        status.redis = value;
    }
    catch (err) {
        status.redis = "failed";
    }
    try {
        await (0, mongo_1.connectMongo)();
        status.mongo = "connected";
    }
    catch (err) {
        status.mongo = "failed";
    }
    try {
        const producer = kafkaClient_1.kafka.producer();
        await producer.connect();
        await producer.disconnect();
        status.kafka = "connected";
    }
    catch (err) {
        status.kafka = "failed";
    }
    res.json(status);
});
app.listen(4001, () => {
    console.log("Auth service running on port 4001");
});
//# sourceMappingURL=index.js.map