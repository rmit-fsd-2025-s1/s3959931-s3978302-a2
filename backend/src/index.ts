import "reflect-metadata";
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { initializeDatabase } from "./config/database";

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Teaching Tutor Backend API is running",
        timestamp: new Date().toISOString(),
    });
});

// Start server
const startServer = async () => {
    try {
        // Initialize database connection
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
