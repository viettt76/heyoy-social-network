import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { GroupMember } from './GroupMember';

@Entity({ name: 'group_chat' })
export class GroupChat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'uuid' })
  administratorId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => GroupMember, groupMember => groupMember.groupChat)
  members: GroupMember[];

}
