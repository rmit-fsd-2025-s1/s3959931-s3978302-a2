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
exports.CourseAssignment = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Course_1 = require("./Course");
let CourseAssignment = class CourseAssignment {
    get assignmentKey() {
        return `${this.lecturerId}-${this.courseId}`;
    }
};
exports.CourseAssignment = CourseAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CourseAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        nullable: false,
    }),
    __metadata("design:type", Number)
], CourseAssignment.prototype, "lecturerId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        nullable: false,
    }),
    __metadata("design:type", Number)
], CourseAssignment.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CourseAssignment.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "lecturerId" }),
    __metadata("design:type", User_1.User)
], CourseAssignment.prototype, "lecturer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.courseAssignments, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "courseId" }),
    __metadata("design:type", Course_1.Course)
], CourseAssignment.prototype, "course", void 0);
exports.CourseAssignment = CourseAssignment = __decorate([
    (0, typeorm_1.Entity)("course_assignments"),
    (0, typeorm_1.Index)(["lecturerId", "courseId"], { unique: true })
], CourseAssignment);
