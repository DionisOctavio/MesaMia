import { Entity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import { DinnerOrmEntity } from './dinner.orm-entity';

@Entity('organizers')
export class OrganizerOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @ManyToMany(() => DinnerOrmEntity, (dinner) => dinner.organizers)
  dinners: DinnerOrmEntity[];
}
