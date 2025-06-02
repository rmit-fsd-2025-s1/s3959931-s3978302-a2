import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from "typeorm";
import { User } from "./User";
import { Course } from "./Course";

@Entity("course_assignments")
@Index(["lecturerId", "courseId"], { unique: true })
export class CourseAssignment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "int",
        nullable: false,
    })
    lecturerId: number;

    @Column({
        type: "int",
        nullable: false,
    })
    courseId: number;

    @CreateDateColumn()
    assignedAt: Date;

    // Relationships
    @ManyToOne(() => User, (user) => user.courseAssignments, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "lecturerId" })
    lecturer: User;

    @ManyToOne(() => Course, (course) => course.courseAssignments, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "courseId" })
    course: Course;

    // Virtual properties
    get assignmentKey(): string {
        return `${this.lecturerId}-${this.courseId}`;
    }
}
