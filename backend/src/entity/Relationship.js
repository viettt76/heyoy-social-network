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
exports.Relationship = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const RelationshipType_1 = require("./RelationshipType");
let Relationship = class Relationship {
    normalizeUserOrder() {
        if (this.user1 > this.user2) {
            [this.user1, this.user2] = [this.user2, this.user1];
        }
    }
};
exports.Relationship = Relationship;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Relationship.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Relationship.prototype, "user1", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Relationship.prototype, "user2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Relationship.prototype, "relationshipTypeId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Relationship.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Relationship.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Relationship.prototype, "normalizeUserOrder", null);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.relationshipAsUser1),
    (0, typeorm_1.JoinColumn)({ name: 'user1', referencedColumnName: 'id' }),
    __metadata("design:type", User_1.User)
], Relationship.prototype, "user1Info", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.relationshipAsUser2),
    (0, typeorm_1.JoinColumn)({ name: 'user2', referencedColumnName: 'id' }),
    __metadata("design:type", User_1.User)
], Relationship.prototype, "user2Info", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RelationshipType_1.RelationshipType),
    (0, typeorm_1.JoinColumn)({ name: 'relationshipTypeId', referencedColumnName: 'id' }),
    __metadata("design:type", RelationshipType_1.RelationshipType)
], Relationship.prototype, "relationship", void 0);
exports.Relationship = Relationship = __decorate([
    (0, typeorm_1.Entity)({ name: 'relationship' }),
    (0, typeorm_1.Index)('IDX_RELATIONSHIP_USER1', ['user1']),
    (0, typeorm_1.Index)('IDX_RELATIONSHIP_USER2', ['user2']),
    (0, typeorm_1.Unique)(['user1', 'user2'])
], Relationship);
