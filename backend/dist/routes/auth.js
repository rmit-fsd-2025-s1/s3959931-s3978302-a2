"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
router.post("/signup", async (req, res) => {
    await authController.signup(req, res);
});
router.post("/signin", async (req, res) => {
    await authController.signin(req, res);
});
router.post("/logout", async (req, res) => {
    await authController.logout(req, res);
});
router.get("/profile", auth_1.authenticateToken, async (req, res) => {
    await authController.getProfile(req, res);
});
exports.default = router;
