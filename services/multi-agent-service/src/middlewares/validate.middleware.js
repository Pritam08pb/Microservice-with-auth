"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => (req, res, next) => {
    try {
        const data = schema.parse(req.body);
        req.body = data;
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: err.issues.map((e) => ({
                    field: e.path[0],
                    message: e.message,
                })),
            });
        }
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map