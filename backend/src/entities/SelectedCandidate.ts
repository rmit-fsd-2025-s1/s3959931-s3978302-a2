import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from "typeorm";
import { Application } from "./Application";
import { User } from "./User";

@Entity("selected_candidates")
@Index(["applicationId"], { unique: true })
export class SelectedCandidate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "int",
        nullable: false,
    })
    applicationId: number;

    @Column({
        type: "int",
        nullable: false,
    })
    selectedById: number;

    @CreateDateColumn()
    selectedAt: Date;

    // Relationships
    @ManyToOne(() => Application, (application) => application.selections, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "applicationId" })
    application: Application;

    @ManyToOne(() => User, (user) => user.candidateSelections, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "selectedById" })
    selectedBy: User;

    // Virtual properties
    get selectionKey(): string {
        return `${this.applicationId}-${this.selectedById}`;
    }
}
