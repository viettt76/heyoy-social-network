import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from './User';
import { NotificationType } from './NotificationType';

@Entity({ name: 'notifications' })
export class Notifications {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'int'})
  type: number

  @Column({ type: 'uuid'})
  relatedId: string

  @Column({ type: 'text'})
  content: string

  @Column({ default: false })
  isRead: boolean

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  receiver: User;

  @OneToOne(() => User)
  @JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
  sender: User;

  @ManyToOne(() => NotificationType)
  @JoinColumn({name: 'type', referencedColumnName: 'id' })
  notificationType: NotificationType
}
