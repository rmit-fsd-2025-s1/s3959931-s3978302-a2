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
var Role_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const typeorm_1 = require("typeorm");
const Application_1 = require("./Application");
let Role = Role_1 = class Role {
    get isTutor() {
        return this.roleName === Role_1.TUTOR;
    }
    get isLabAssistant() {
        return this.roleName === Role_1.LAB_ASSISTANT;
    }
};
exports.Role = Role;
Role.TUTOR = "tutor";
Role.LAB_ASSISTANT = "lab_assistant";
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Role.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "varchar",
        length: 50,
        unique: true,
        nullable: false,
    }),
    __metadata("design:type", String)
], Role.prototype, "roleName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "text",
        nullable: true,
    }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Application_1.Application, (application) => application.role),
    __metadata("design:type", Array)
], Role.prototype, "applications", void 0);
exports.Role = Role = Role_1 = __decorate([
    (0, typeorm_1.Entity)("roles")
], Role);
