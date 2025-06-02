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
exports.SelectedCandidate = void 0;
const typeorm_1 = require("typeorm");
const Application_1 = require("./Application");
const User_1 = require("./User");
let SelectedCandidate = class SelectedCandidate {
    get selectionKey() {
        return `${this.applicationId}-${this.selectedById}`;
    }
};
exports.SelectedCandidate = SelectedCandidate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SelectedCandidate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        nullable: false,
    }),
    __metadata("design:type", Number)
], SelectedCandidate.prototype, "applicationId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        nullable: false,
    }),
    __metadata("design:type", Number)
], SelectedCandidate.prototype, "selectedById", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SelectedCandidate.prototype, "selectedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Application_1.Application, (application) => application.selections, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "applicationId" }),
    __metadata("design:type", Application_1.Application)
], SelectedCandidate.prototype, "application", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.candidateSelections, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "selectedById" }),
    __metadata("design:type", User_1.User)
], SelectedCandidate.prototype, "selectedBy", void 0);
exports.SelectedCandidate = SelectedCandidate = __decorate([
    (0, typeorm_1.Entity)("selected_candidates"),
    (0, typeorm_1.Index)(["applicationId"], { unique: true })
], SelectedCandidate);
