"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = exports.ApplicationStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Course_1 = require("./Course");
const Role_1 = require("./Role");
const SelectedCandidate_1 = require("./SelectedCandidate");
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "pending";
    ApplicationStatus["SELECTED"] = "selected";
    ApplicationStatus["REJECTED"] = "rejected";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
let Application = class Application {
    get isSelected() {
        return this.status === ApplicationStatus.SELECTED;
    }
    get isPending() {
        return this.status === ApplicationStatus.PENDING;
    }
    get isRejected() {
        return this.status === ApplicationStatus.REJECTED;
    }
    get applicationKey() {
        return `${this.candidateId}-${this.courseId}-${this.roleId}`;
    }
};
exports.Application = Application;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Application.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Application.prototype, "candidateId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Application.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        nullable: false,
    }),
    __metadata("design:type", Number)
], Application.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ApplicationStatus,
        default: ApplicationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Application.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "json",
        nullable: true,
    }),
    __metadata("design:type", Object)
], Application.prototype, "availability", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
    }),
    __metadata("design:type", String)
], Application.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
    }),
    __metadata("design:type", String)
], Application.prototype, "experience", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
    }),
    __metadata("design:type", String)
], Application.prototype, "motivation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Application.prototype, "appliedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Application.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.applications, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "candidateId" }),
    __metadata("design:type", User_1.User)
], Application.prototype, "candidate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.applications, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "courseId" }),
    __metadata("design:type", Course_1.Course)
], Application.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Role_1.Role, (role) => role.applications, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "roleId" }),
    __metadata("design:type", Role_1.Role)
], Application.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SelectedCandidate_1.SelectedCandidate, (selectedCandidate) => selectedCandidate.application),
    __metadata("design:type", Array)
], Application.prototype, "selections", void 0);
exports.Application = Application = __decorate([
    (0, typeorm_1.Entity)("applications"),
    (0, typeorm_1.Index)(["candidateId", "courseId", "roleId"], { unique: true })
], Application);
