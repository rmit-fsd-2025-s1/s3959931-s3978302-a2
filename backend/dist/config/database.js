"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const User_1 = require("../entities/User");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "209.38.26.237",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "your_username",
    password: process.env.DB_PASSWORD || "your_password",
    database: process.env.DB_NAME || "your_database_name",
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV === "development",
    entities: [
        User_1.User,
    ],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log("✅ Database connection initialized successfully");
        console.log("📊 User table ready for authentication");
    }
    catch (error) {
        console.error("❌ Error during database initialization:", error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
