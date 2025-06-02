import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: number;
    email: string;
    userType: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Access token is required",
        });
        return;
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret_key"
        ) as JwtPayload;

        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: "Invalid or expired token",
        });
        return;
    }
};

export const requireUserType = (allowedTypes: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
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
