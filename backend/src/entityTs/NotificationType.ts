import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'notification_type' })
export class NotificationType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;
}
