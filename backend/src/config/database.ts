import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "../entities/User";
import { Course } from "../entities/Course";
import { Role } from "../entities/Role";
import { CourseAssignment } from "../entities/CourseAssignment";
import { Application } from "../entities/Application";
import { SelectedCandidate } from "../entities/SelectedCandidate";

config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "209.38.26.237",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "your_username",
    password: process.env.DB_PASSWORD || "your_password",
    database: process.env.DB_NAME || "your_database_name",
    synchronize: process.env.NODE_ENV !== "production", // Auto-create tables in development
    logging: process.env.NODE_ENV === "development",
    entities: [
        User,
        Course,
        Role,
        CourseAssignment,
        Application,
        SelectedCandidate,
    ],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],
});

export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log("✅ Database connection initialized successfully");

        // Seed default roles if they don't exist
        await seedDefaultRoles();
    } catch (error) {
        console.error("❌ Error during database initialization:", error);
        throw error;
    }
};

const seedDefaultRoles = async () => {
    try {
        const roleRepository = AppDataSource.getRepository(Role);

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
                description:
                    "Lab Assistant role for assisting in laboratory sessions",
            });
            await roleRepository.save(labAssistant);
            console.log("✅ Lab Assistant role created");
        }
    } catch (error) {
        console.error("❌ Error seeding default roles:", error);
    }
};
