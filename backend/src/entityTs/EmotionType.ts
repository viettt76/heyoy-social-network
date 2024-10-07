import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'emotion_type' })
export class EmotionType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;
}
