import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PostVisibility } from './PostVisibility'; 
import { PictureOfPost } from './PictureOfPost';
import { EmotionPost } from './EmotionPost'; 

@Entity({ name: 'post' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  poster!: string;

  @Column({ type: 'int' })
  visibilityTypeId!: number;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => PostVisibility)
  @JoinColumn({ name: 'visibilityTypeId', referencedColumnName: 'id' })
  visibility!: PostVisibility;

  @OneToMany(() => PictureOfPost, picture => picture.postId, { cascade: true })
  pictures!: PictureOfPost[];

  @OneToMany(() => EmotionPost, emotion => emotion.postId, { cascade: true })
  emotions!: EmotionPost[];
}
