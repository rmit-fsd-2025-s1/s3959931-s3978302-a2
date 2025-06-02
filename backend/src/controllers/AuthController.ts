import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User, UserType } from "../entities/User";
import { validateSignupData, validateSigninData } from "../utils/validation";

export class AuthController {
    private userRepository = AppDataSource.getRepository(User);

    async signup(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, firstName, lastName, userType, phone } =
                req.body;

            console.log("🔄 Signup attempt for email:", email);

            // Validate input data
            const validation = validateSignupData(req.body);
            if (!validation.isValid) {
                console.log("❌ Signup validation failed:", validation.errors);
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors,
                });
                return;
            }

            // Check if user already exists
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

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log("🔐 Password hashed successfully");

            // Create new user
            const newUser = this.userRepository.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                userType: userType as UserType,
                phone: phone || null,
            });

            // Save user to database
            const savedUser = await this.userRepository.save(newUser);
            console.log("✅ User created successfully:", savedUser.id);

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: savedUser.id,
                    email: savedUser.email,
                    userType: savedUser.userType,
                },
                process.env.JWT_SECRET || "fallback_secret_key",
                { expiresIn: "7d" }
            );

            // Return success response (exclude password)
            const { password: _, ...userWithoutPassword } = savedUser;

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: userWithoutPassword,
                    token,
                },
            });
        } catch (error) {
            console.error("💥 Signup error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during registration",
            });
        }
    }

    async signin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            console.log("🔍 Signin attempt for email:", email);

            // Validate input data
            const validation = validateSigninData(req.body);
            if (!validation.isValid) {
                console.log("❌ Validation failed:", validation.errors);
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors,
                });
                return;
            }

            // Find user by email
            const user = await this.userRepository.findOne({
                where: { email },
            });
            console.log(
                "🔍 User found in database:",
                user ? `Yes (ID: ${user.id})` : "No"
            );

            if (!user) {
                console.log("❌ User not found for email:", email);
                res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
                return;
            }

            // Check if user is blocked
            if (user.isBlocked) {
                console.log("❌ User is blocked:", email);
                res.status(403).json({
                    success: false,
                    message:
                        "Your account has been blocked. Please contact administrator.",
                });
                return;
            }

            // Verify password
            console.log("🔍 Comparing password with hash...");
            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );
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

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    userType: user.userType,
                },
                process.env.JWT_SECRET || "fallback_secret_key",
                { expiresIn: "7d" }
            );

            // Return success response (exclude password)
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
        } catch (error) {
            console.error("💥 Signin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during login",
            });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            console.log("🔄 Logout request received");
            // Since we're using JWTs, logout is handled on the client side
            // by removing the token from storage
            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error) {
            console.error("💥 Logout error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during logout",
            });
        }
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
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

            // Return user profile without password
            const { password: _, ...userProfile } = user;
            console.log("✅ Profile retrieved for:", user.email);

            res.status(200).json({
                success: true,
                message: "Profile retrieved successfully",
                data: {
                    user: userProfile,
                },
            });
        } catch (error) {
            console.error("💥 Get profile error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error while fetching profile",
            });
        }
    }
}
