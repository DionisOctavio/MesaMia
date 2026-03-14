import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { DinnerOrmEntity } from './dinner.orm-entity';
import { PersonOrmEntity } from './person.orm-entity';

@Entity('families')
export class FamilyOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  dinnerId: string;

  @Column()
  name: string;

  @ManyToOne(() => DinnerOrmEntity, (dinner) => dinner.families, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dinnerId' })
  dinner: DinnerOrmEntity;

  @OneToMany(() => PersonOrmEntity, (person) => person.family, { cascade: true })
  people: PersonOrmEntity[];
}
