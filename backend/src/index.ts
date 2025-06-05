import "reflect-metadata";
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { initializeDatabase } from "./config/database";
import authRoutes from "./routes/auth";
import applicationRoutes from "./routes/application";
import databaseRoutes from "./routes/database";
import { getMelbourneTimestamp } from "./utils/dateUtils";

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/database", databaseRoutes);

// Basic health check route
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Teaching Tutor Backend API is running",
        timestamp: getMelbourneTimestamp(),
        timezone: "Australia/Melbourne (AEST/AEDT)",
    });
});

// Database test route
app.get("/db-test", async (req, res) => {
    try {
        const { DatabaseResetService } = await import("./utils/dbReset");

        const isConnected = await DatabaseResetService.checkDatabaseConnection();
        const isEmpty = await DatabaseResetService.isDatabaseEmpty();

        res.json({
            success: true,
            database: {
                connected: isConnected,
                isEmpty: isEmpty,
                status: isEmpty ? "EMPTY - needs data" : "HAS DATA"
            },
            timestamp: getMelbourneTimestamp(),
            timezone: "Australia/Melbourne (AEST/AEDT)",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: getMelbourneTimestamp(),
            timezone: "Australia/Melbourne (AEST/AEDT)",
        });
    }
});

// Manual database reset route
app.post("/db-reset", async (req, res) => {
    try {
        console.log("🔄 Manual database reset requested via /db-reset");

        const { DatabaseResetService } = await import("./utils/dbReset");
        await DatabaseResetService.resetDatabase();

        res.json({
            success: true,
            message: "Database reset completed successfully",
            timestamp: getMelbourneTimestamp(),
            timezone: "Australia/Melbourne (AEST/AEDT)",
        });
    } catch (error) {
        console.error("❌ Database reset failed:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: getMelbourneTimestamp(),
            timezone: "Australia/Melbourne (AEST/AEDT)",
        });
    }
});

// Start server
const startServer = async () => {
    try {
        // Initialize database connection with auto-reset functionality
        await initializeDatabaseWithAutoReset();

        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
            console.log(`📋 Application endpoints: http://localhost:${PORT}/api/applications`);
            console.log(`🗄️ Database endpoints: http://localhost:${PORT}/api/database`);
            console.log(`📊 Database status: http://localhost:${PORT}/api/database/status`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        console.warn("⚠️ Starting server anyway for debugging purposes");

        app.listen(PORT, () => {
            console.log(`⚠️ Server is running on port ${PORT} (DATABASE MAY NOT BE AVAILABLE)`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`🔧 Manual database reset: POST http://localhost:${PORT}/api/database/reset`);
        });
    }
};

// Enhanced database initialization with auto-reset
const initializeDatabaseWithAutoReset = async () => {
    console.log("🚀 Starting Teaching Tutor Backend API...");
    console.log("🔄 Initializing database with auto-reset capability...");

    try {
        // Import the reset service
        const { DatabaseResetService } = await import("./utils/dbReset");

        // Check if database is empty or needs reset
        console.log("🔍 Checking if database needs initialization...");
        const isEmpty = await DatabaseResetService.isDatabaseEmpty();

        if (isEmpty) {
            console.log("📊 Database is empty, performing auto-reset...");
            await DatabaseResetService.resetDatabase();
            console.log("✅ Database auto-reset completed successfully");
        } else {
            console.log("📊 Database has data, checking for updates...");
            // Try normal initialization to add any missing data
            try {
                await initializeDatabase();
                console.log("✅ Database initialization completed successfully");
            } catch (initError) {
                console.warn("⚠️ Standard initialization failed, attempting reset...");
                await DatabaseResetService.resetDatabase();
                console.log("✅ Database reset completed successfully");
            }
        }

        // Verify database status
        const isConnected = await DatabaseResetService.checkDatabaseConnection();
        const finalIsEmpty = await DatabaseResetService.isDatabaseEmpty();

        console.log(`📊 Final database status: Connected=${isConnected}, Empty=${finalIsEmpty}`);

    } catch (error) {
        console.error("❌ Database initialization failed:", error);
        console.log("🔄 Attempting emergency database reset...");

        try {
            const { DatabaseResetService } = await import("./utils/dbReset");
            await DatabaseResetService.resetDatabase();
            console.log("✅ Emergency database reset completed");
        } catch (resetError) {
            console.error("❌ Emergency reset also failed:", resetError);
            console.warn("⚠️ Continuing server startup without database - manual intervention required");
        }
    }
};

startServer();
