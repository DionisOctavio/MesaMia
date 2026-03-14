import { Inject, Injectable } from '@nestjs/common';
import { Dinner, DinnerMode } from '../../domain/entities/dinner.entity';
import type { IDinnerRepository } from '../../domain/repositories/dinner.repository';

export interface CreateDinnerCommand {
  name: string;
  restaurant: string;
  date: Date;
  menuPrice: string;
  starters: string;
  mains: string;
  desserts: string;
  drinks: string;
  mode?: DinnerMode;
  cartaProducts?: string;
  organizerIds?: string[];
}

@Injectable()
export class CreateDinnerUseCase {
  constructor(
    @Inject('IDinnerRepository')
    private readonly dinnerRepository: IDinnerRepository,
  ) {}

  async execute(command: CreateDinnerCommand): Promise<Dinner> {
    const dinner = Dinner.create(
      command.name,
      command.restaurant,
      command.date,
      command.menuPrice,
      command.starters,
      command.mains,
      command.desserts,
      command.drinks,
      command.mode || DinnerMode.MENU,
      command.cartaProducts || '[]',
      command.organizerIds || [],
    );
    await this.dinnerRepository.save(dinner);
    return dinner;
  }
}
