import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Dinner, DinnerMode } from '../../domain/entities/dinner.entity';
import type { IDinnerRepository } from '../../domain/repositories/dinner.repository';

export interface UpdateDinnerCommand {
  code: string;
  organizerId: string; // The one making the update
  name?: string;
  restaurant?: string;
  date?: Date;
  menuPrice?: string;
  starters?: string;
  mains?: string;
  desserts?: string;
  drinks?: string;
  mode?: DinnerMode;
  cartaProducts?: string;
}

@Injectable()
export class UpdateDinnerUseCase {
  constructor(
    @Inject('IDinnerRepository')
    private readonly dinnerRepository: IDinnerRepository,
  ) {}

  async execute(command: UpdateDinnerCommand): Promise<Dinner> {
    const dinner = await this.dinnerRepository.findByCode(command.code);
    if (!dinner) throw new NotFoundException('Cena no encontrada');

    // Check if the requester is an organizer
    // Note: findByCode returns any | null in repository interface, but our repo returns the ORM entity if we aren't careful.
    // Actually our repository findByCode returns the ORM data which has organizers relation now.
    
    const dbDinner = dinner as any;
    const isOrganizer = dbDinner.organizers.some((o: any) => o.id === command.organizerId);
    if (!isOrganizer) throw new ForbiddenException('No tienes permiso para editar esta cena');

    // Mapeamos a objeto de dominio para poder usar el repositorio save (que espera un Dinner)
    const updatedDinner = new Dinner(
      dbDinner.id,
      command.name ?? dbDinner.name,
      command.restaurant ?? dbDinner.restaurant,
      command.date ?? new Date(dbDinner.date),
      command.menuPrice ?? dbDinner.menuPrice,
      dbDinner.code,
      command.starters ?? dbDinner.starters,
      command.mains ?? dbDinner.mains,
      command.desserts ?? dbDinner.desserts,
      command.drinks ?? dbDinner.drinks,
      command.mode ?? dbDinner.mode,
      command.cartaProducts ?? dbDinner.cartaProducts,
      dbDinner.organizers.map((o: any) => o.id)
    );

    await this.dinnerRepository.save(updatedDinner);
    return updatedDinner;
  }
}
