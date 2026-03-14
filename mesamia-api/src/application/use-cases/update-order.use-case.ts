import { Inject, Injectable } from '@nestjs/common';
import type { IOrderRepository } from '../../domain/repositories/order.repository';

export interface UpdateOrderCommand {
  personId: string;
  starter?: string;
  main?: string;
  dessert?: string;
  drink?: string;
  cartaItems?: string;
}

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: UpdateOrderCommand): Promise<void> {
    const order = await this.orderRepo.findByPersonId(command.personId);
    if (!order) throw new Error('Pedido no encontrado');

    if (command.starter !== undefined) order.starter = command.starter;
    if (command.main !== undefined) order.main = command.main;
    if (command.dessert !== undefined) order.dessert = command.dessert;
    if (command.drink !== undefined) order.drink = command.drink;
    if (command.cartaItems !== undefined) order.cartaItems = command.cartaItems;

    await this.orderRepo.save(order);
  }
}
