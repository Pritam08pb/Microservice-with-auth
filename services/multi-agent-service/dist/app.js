"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const error_middleware_1 = require("./middlewares/error.middleware");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// security middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// body parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// logging
app.use((0, morgan_1.default)("dev"));
// routes
app.use("/", routes_1.default);
// global error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map