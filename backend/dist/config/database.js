"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const User_1 = require("../entities/User");
const Course_1 = require("../entities/Course");
const Role_1 = require("../entities/Role");
const CourseAssignment_1 = require("../entities/CourseAssignment");
const Application_1 = require("../entities/Application");
const SelectedCandidate_1 = require("../entities/SelectedCandidate");
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
        Course_1.Course,
        Role_1.Role,
        CourseAssignment_1.CourseAssignment,
        Application_1.Application,
        SelectedCandidate_1.SelectedCandidate,
    ],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log("✅ Database connection initialized successfully");
        await seedDefaultRoles();
    }
    catch (error) {
        console.error("❌ Error during database initialization:", error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
const seedDefaultRoles = async () => {
    try {
        const roleRepository = exports.AppDataSource.getRepository(Role_1.Role);
        const tutorRole = await roleRepository.findOne({
            where: { roleName: "tutor" },
        });
        if (!tutorRole) {
            const tutor = roleRepository.create({
                roleName: "tutor",
                description: "Tutor role for conducting tutorial sessions",
            });
            await roleRepository.save(tutor);
            console.log("✅ Tutor role created");
        }
        const labAssistantRole = await roleRepository.findOne({
            where: { roleName: "lab_assistant" },
        });
        if (!labAssistantRole) {
            const labAssistant = roleRepository.create({
                roleName: "lab_assistant",
                description: "Lab Assistant role for assisting in laboratory sessions",
            });
            await roleRepository.save(labAssistant);
            console.log("✅ Lab Assistant role created");
        }
    }
    catch (error) {
        console.error("❌ Error seeding default roles:", error);
    }
};
