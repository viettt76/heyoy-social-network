import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'relationship_type' })
export class RelationshipType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;
}
