import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './Post';

@Entity({ name: 'picture_of_post' })
export class PictureOfPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  postId!: string;

  @Column({ type: 'varchar' })
  picture!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  visibility!: Post;

}
