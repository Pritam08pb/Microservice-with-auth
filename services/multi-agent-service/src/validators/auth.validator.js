"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email("Invalid email format")
        .transform((val) => val.toLowerCase().trim()),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password too long"),
});
// login can reuse same schema
exports.loginSchema = exports.signupSchema;
//# sourceMappingURL=auth.validator.js.map