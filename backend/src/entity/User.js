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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const Relationship_1 = require("./Relationship");
const Comment_1 = require("./Comment");
const FriendRequest_1 = require("./FriendRequest");
const GroupMember_1 = require("./GroupMember");
const Message_1 = require("./Message");
const Notifications_1 = require("./Notifications");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "birthday", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['male', 'female', 'other'], default: 'male' }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    (0, typeorm_1.Index)('IDX_USER_HOME_TOWN'),
    __metadata("design:type", Object)
], User.prototype, "homeTown", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    (0, typeorm_1.Index)('IDX_USER_SCHOOL'),
    __metadata("design:type", Object)
], User.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    (0, typeorm_1.Index)('IDX_USER_WORKPLACE'),
    __metadata("design:type", Object)
], User.prototype, "workplace", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Relationship_1.Relationship, relationship => relationship.user1Info),
    __metadata("design:type", Array)
], User.prototype, "relationshipAsUser1", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Relationship_1.Relationship, relationship => relationship.user2Info),
    __metadata("design:type", Array)
], User.prototype, "relationshipAsUser2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FriendRequest_1.FriendRequest, friendRequest => friendRequest.sender),
    __metadata("design:type", Array)
], User.prototype, "friendRequestAsSender", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FriendRequest_1.FriendRequest, friendRequest => friendRequest.receiver),
    __metadata("design:type", Array)
], User.prototype, "friendRequestAsReceiver", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Comment_1.Comment, comment => comment.commentatorInfo),
    __metadata("design:type", Array)
], User.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => GroupMember_1.GroupMember, groupMember => groupMember.user),
    __metadata("design:type", Array)
], User.prototype, "groupMembers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Message_1.Message, message => message.senderInfo),
    __metadata("design:type", Array)
], User.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Notifications_1.Notifications, notification => notification.receiver),
    __metadata("design:type", Array)
], User.prototype, "receiverInfo", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('user')
], User);
