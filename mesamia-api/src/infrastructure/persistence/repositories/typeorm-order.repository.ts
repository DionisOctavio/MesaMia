import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../domain/entities/order.entity';
import { IOrderRepository } from '../../../domain/repositories/order.repository';
import { OrderOrmEntity } from '../entities/order.orm-entity';

@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repository: Repository<OrderOrmEntity>,
  ) {}

  async save(order: Order): Promise<void> {
    const ormEntity = this.repository.create(order);
    await this.repository.save(ormEntity);
  }

  async findByPersonId(personId: string): Promise<Order | null> {
    const e = await this.repository.findOne({ where: { personId } });
    if (!e) return null;
    return new Order(e.id, e.personId, e.starter, e.main, e.dessert, e.drink, e.cartaItems);
  }
}
