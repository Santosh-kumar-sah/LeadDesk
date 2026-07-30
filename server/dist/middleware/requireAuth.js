"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const requireAuth = (req, res, next) => {
    try {
        let token;
        // Check Authorization header (Bearer <token>)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        else {
            // Fallback to cookie
            token = req.cookies?.token;
        }
        if (!token) {
            res.status(401).json({
                error: { message: "Unauthorized: Missing authentication token" },
            });
            return;
        }
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({
            error: { message: "Unauthorized: Invalid or expired token" },
        });
    }
};
exports.requireAuth = requireAuth;
