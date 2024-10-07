import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { GroupChat } from './GroupChat';
import { User } from './User';

@Entity({ name: 'group_member' })
@Unique(['groupChatId', 'memberId'])
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  groupChatId!: string;

  @Column({ type: 'uuid' })
  memberId!: string;

  @Column({ type: 'varchar', nullable: true })
  nickname?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => GroupChat)
  @JoinColumn({ name: 'groupChatId', referencedColumnName: 'id'})
  groupChat: GroupChat;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id'})
  user: User;
}
