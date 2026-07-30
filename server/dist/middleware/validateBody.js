"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const zod_1 = require("zod");
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const fieldErrors = {};
                err.errors.forEach((e) => {
                    const path = e.path.join(".");
                    if (!fieldErrors[path]) {
                        fieldErrors[path] = [];
                    }
                    fieldErrors[path].push(e.message);
                });
                res.status(400).json({
                    error: {
                        message: "Validation failed",
                        fields: fieldErrors,
                    },
                });
                return;
            }
            next(err);
        }
    };
};
exports.validateBody = validateBody;
