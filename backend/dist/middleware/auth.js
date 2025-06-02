"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUserType = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Access token is required",
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: "Invalid or expired token",
        });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const requireUserType = (allowedTypes) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        if (!allowedTypes.includes(req.user.userType)) {
            res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            });
            return;
        }
        next();
    };
};
exports.requireUserType = requireUserType;
