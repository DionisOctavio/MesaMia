import { Body, Controller, Patch, Get, Param, Inject } from '@nestjs/common';
import { UpdateOrderUseCase } from '../../application/use-cases/update-order.use-case';
import type { UpdateOrderCommand } from '../../application/use-cases/update-order.use-case';
import type { IOrderRepository } from '../../domain/repositories/order.repository';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly updateOrderUseCase: UpdateOrderUseCase,
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Patch()
  async update(@Body() body: UpdateOrderCommand) {
    return this.updateOrderUseCase.execute(body);
  }

  @Get(':personId')
  async getByPersonId(@Param('personId') personId: string) {
    return this.orderRepository.findByPersonId(personId);
  }
}
