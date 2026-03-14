import { Entity, PrimaryColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { FamilyOrmEntity } from './family.orm-entity';
import { OrganizerOrmEntity } from './organizer.orm-entity';

@Entity('dinners')
export class DinnerOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  restaurant: string;

  @Column()
  date: Date;

  @Column()
  menuPrice: string;

  @Column({ unique: true })
  code: string;

  @Column({ unique: true, nullable: true })
  adminCode: string;

  @Column({ default: '' })
  starters: string;

  @Column({ default: '' })
  mains: string;

  @Column({ default: '' })
  desserts: string;

  @Column({ default: '' })
  drinks: string;

  @Column({ default: 'MENU' })
  mode: string;

  @Column()
  cartaProducts: string;

  @ManyToMany(() => OrganizerOrmEntity, (organizer) => organizer.dinners)
  @JoinTable({
    name: 'dinner_organizers',
    joinColumn: { name: 'dinnerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organizerId', referencedColumnName: 'id' }
  })
  organizers: OrganizerOrmEntity[];

  @OneToMany(() => FamilyOrmEntity, (family) => family.dinner)
  families: FamilyOrmEntity[];
}
