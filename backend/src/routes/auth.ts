import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/signup", async (req, res) => {
    await authController.signup(req, res);
});

router.post("/signin", async (req, res) => {
    await authController.signin(req, res);
});

router.post("/logout", async (req, res) => {
    await authController.logout(req, res);
});

// Protected routes
router.get("/profile", authenticateToken, async (req, res) => {
    await authController.getProfile(req, res);
});

export default router;
