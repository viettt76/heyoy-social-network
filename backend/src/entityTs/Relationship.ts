import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique, BeforeInsert } from 'typeorm';
import { User } from './User'; 
import { RelationshipType } from './RelationshipType'; 

@Entity({ name: 'relationship' })
@Index('IDX_RELATIONSHIP_USER1', ['user1'])
@Index('IDX_RELATIONSHIP_USER2', ['user2'])
@Unique(['user1', 'user2'])
export class Relationship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user1!: string;

  @Column({ type: 'uuid' })
  user2!: string;

  @Column({ type: 'int', nullable: true })
  relationshipTypeId?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
    normalizeUserOrder() {
        if (this.user1 > this.user2) {
            [this.user1, this.user2] = [this.user2, this.user1];
        }
    }

  @ManyToOne(() => User, user => user.relationshipAsUser1)
  @JoinColumn({ name: 'user1', referencedColumnName: 'id' })
  user1Info!: User;

  @ManyToOne(() => User, user => user.relationshipAsUser2)
  @JoinColumn({ name: 'user2', referencedColumnName: 'id' })
  user2Info!: User;

  @ManyToOne(() => RelationshipType)
  @JoinColumn({ name: 'relationshipTypeId', referencedColumnName: 'id' })
  relationship!: RelationshipType;
}
