import { Entity, PrimaryColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { FamilyOrmEntity } from './family.orm-entity';
import { OrderOrmEntity } from './order.orm-entity';

@Entity('people')
export class PersonOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  familyId: string;

  @Column()
  name: string;

  @ManyToOne(() => FamilyOrmEntity, (family) => family.people, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family: FamilyOrmEntity;

  @OneToOne(() => OrderOrmEntity, (order) => order.person, { cascade: true })
  order: OrderOrmEntity;
}
