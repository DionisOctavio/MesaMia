import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findByPersonId(personId: string): Promise<Order | null>;
}
