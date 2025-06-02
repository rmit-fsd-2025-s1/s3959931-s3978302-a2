import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from "typeorm";
import { User } from "./User";
import { Course } from "./Course";
import { Role } from "./Role";
import { SelectedCandidate } from "./SelectedCandidate";

export enum ApplicationStatus {
    PENDING = "pending",
    SELECTED = "selected",
    REJECTED = "rejected",
}

@Entity("applications")
@Index(["candidateId", "courseId", "roleId"], { unique: true })
export class Application {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "int",
        nullable: false,
    })
    candidateId: number;

    @Column({
        type: "int",
        nullable: false,
    })
    courseId: number;

    @Column({
        type: "int",
        nullable: false,
    })
    roleId: number;

    @Column({
        type: "enum",
        enum: ApplicationStatus,
        default: ApplicationStatus.PENDING,
    })
    status: ApplicationStatus;

    @Column({
        type: "json",
        nullable: true,
    })
    availability?: object;

    @Column({
        type: "text",
        nullable: true,
    })
    skills?: string;

    @Column({
        type: "text",
        nullable: true,
    })
    experience?: string;

    @Column({
        type: "text",
        nullable: true,
    })
    motivation?: string;

    @CreateDateColumn()
    appliedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => User, (user) => user.applications, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "candidateId" })
    candidate: User;

    @ManyToOne(() => Course, (course) => course.applications, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "courseId" })
    course: Course;

    @ManyToOne(() => Role, (role) => role.applications, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "roleId" })
    role: Role;

    @OneToMany(
        () => SelectedCandidate,
        (selectedCandidate) => selectedCandidate.application
    )
    selections: SelectedCandidate[];

    // Virtual properties
    get isSelected(): boolean {
        return this.status === ApplicationStatus.SELECTED;
    }

    get isPending(): boolean {
        return this.status === ApplicationStatus.PENDING;
    }

    get isRejected(): boolean {
        return this.status === ApplicationStatus.REJECTED;
    }

    get applicationKey(): string {
        return `${this.candidateId}-${this.courseId}-${this.roleId}`;
    }
}
