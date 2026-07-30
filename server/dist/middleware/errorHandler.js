"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (process.env.NODE_ENV !== "production") {
        console.error("Unhandled Error Logged:", err);
    }
    res.status(statusCode).json({
        error: {
            message,
            ...(err.fields ? { fields: err.fields } : {}),
        },
    });
};
exports.errorHandler = errorHandler;
