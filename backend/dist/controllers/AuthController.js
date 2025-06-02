"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const validation_1 = require("../utils/validation");
class AuthController {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(User_1.User);
    }
    async signup(req, res) {
        try {
            const { email, password, firstName, lastName, userType, phone } = req.body;
            console.log("🔄 Signup attempt for email:", email);
            const validation = (0, validation_1.validateSignupData)(req.body);
            if (!validation.isValid) {
                console.log("❌ Signup validation failed:", validation.errors);
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors,
                });
                return;
            }
            const existingUser = await this.userRepository.findOne({
                where: { email },
            });
            if (existingUser) {
                console.log("❌ User already exists:", email);
                res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                });
                return;
            }
            const saltRounds = 12;
            const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
            console.log("🔐 Password hashed successfully");
            const newUser = this.userRepository.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                userType: userType,
                phone: phone || null,
            });
            const savedUser = await this.userRepository.save(newUser);
            console.log("✅ User created successfully:", savedUser.id);
            const token = jsonwebtoken_1.default.sign({
                userId: savedUser.id,
                email: savedUser.email,
                userType: savedUser.userType,
            }, process.env.JWT_SECRET || "fallback_secret_key", { expiresIn: "7d" });
            const { password: _, ...userWithoutPassword } = savedUser;
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: userWithoutPassword,
                    token,
                },
            });
        }
        catch (error) {
            console.error("💥 Signup error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during registration",
            });
        }
    }
    async signin(req, res) {
        try {
            const { email, password } = req.body;
            console.log("🔍 Signin attempt for email:", email);
            const validation = (0, validation_1.validateSigninData)(req.body);
            if (!validation.isValid) {
                console.log("❌ Validation failed:", validation.errors);
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors,
                });
                return;
            }
            const user = await this.userRepository.findOne({
                where: { email },
            });
            console.log("🔍 User found in database:", user ? `Yes (ID: ${user.id})` : "No");
            if (!user) {
                console.log("❌ User not found for email:", email);
                res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
                return;
            }
            if (user.isBlocked) {
                console.log("❌ User is blocked:", email);
                res.status(403).json({
                    success: false,
                    message: "Your account has been blocked. Please contact administrator.",
                });
                return;
            }
            console.log("🔍 Comparing password with hash...");
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            console.log("🔍 Password valid:", isPasswordValid);
            if (!isPasswordValid) {
                console.log("❌ Invalid password for email:", email);
                res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
                return;
            }
            console.log("✅ Authentication successful for:", email);
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
                userType: user.userType,
            }, process.env.JWT_SECRET || "fallback_secret_key", { expiresIn: "7d" });
            const { password: _, ...userWithoutPassword } = user;
            console.log("📤 Sending success response to frontend");
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    user: userWithoutPassword,
                    token,
                },
            });
        }
        catch (error) {
            console.error("💥 Signin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during login",
            });
        }
    }
    async logout(req, res) {
        try {
            console.log("🔄 Logout request received");
            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        }
        catch (error) {
            console.error("💥 Logout error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during logout",
            });
        }
    }
    async getProfile(req, res) {
        try {
            const userId = req.user?.userId;
            console.log("🔄 Profile request for user ID:", userId);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
                return;
            }
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                console.log("❌ User not found for ID:", userId);
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }
            const { password: _, ...userProfile } = user;
            console.log("✅ Profile retrieved for:", user.email);
            res.status(200).json({
                success: true,
                message: "Profile retrieved successfully",
                data: {
                    user: userProfile,
                },
            });
        }
        catch (error) {
            console.error("💥 Get profile error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error while fetching profile",
            });
        }
    }
}
exports.AuthController = AuthController;
