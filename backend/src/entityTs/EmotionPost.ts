import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique
  } from "typeorm";
  import { EmotionType } from './EmotionType';
import { User } from './User';
  
  @Entity('emotion_post')
  @Unique(['postId', 'userId'])
  export class EmotionPost {
  
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column('uuid')
    postId: string;
  
    @Column('uuid')
    userId: string;
  
    @Column('int')
    emotionTypeId: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @ManyToOne(() => EmotionType)
    @JoinColumn({ name: 'emotionTypeId', referencedColumnName: 'id' })
    emotion: EmotionType;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    userInfo: User;
  }
  