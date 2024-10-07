import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';

@Entity({ name: 'friend_request' })
@Unique(['senderId', 'receiverId'])
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  senderId!: string;

  @Column({ type: 'uuid' })
  receiverId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.friendRequestAsSender, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
  sender!: User;

  @ManyToOne(() => User, (user) => user.friendRequestAsReceiver, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId', referencedColumnName: 'id' })
  receiver!: User;
}
