import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PersonOrmEntity } from './person.orm-entity';

@Entity('orders')
export class OrderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  personId: string;

  @Column({ default: '' })
  starter: string;

  @Column({ default: '' })
  main: string;

  @Column({ default: '' })
  dessert: string;

  @Column({ default: '' })
  drink: string;

  @Column({ default: '[]' })
  cartaItems: string;

  @OneToOne(() => PersonOrmEntity, (person) => person.order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personId' })
  person: PersonOrmEntity;
}
