import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'post_visibility' })
export class PostVisibility {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;
}
