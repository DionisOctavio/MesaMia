import { Controller, Delete, Param, Get, Query, Inject, UseGuards, Request, NotFoundException, Patch, Body } from '@nestjs/common';
import type { IFamilyRepository } from '../../domain/repositories/family.repository';
import { AuthGuard } from '../auth/auth.guard';
import type { IDinnerRepository } from '../../domain/repositories/dinner.repository';

@Controller('families')
export class FamilyController {
  constructor(
    @Inject('IFamilyRepository') private readonly familyRepo: IFamilyRepository,
    @Inject('IDinnerRepository') private readonly dinnerRepo: IDinnerRepository,
  ) { }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.familyRepo.delete(id);
    return { success: true };
  }

  /** IMPORTANT: Static routes must be declared BEFORE dynamic `:id` routes in NestJS */
  @Get('recover')
  async recover(@Query('phone') phone: string) {
    const family = await this.familyRepo.findByPersonPhone(phone);
    if (!family) throw new NotFoundException('No se encontró ningún grupo con ese teléfono');

    // We want the full data of the dinner too to confirm the code
    const dinner = await this.dinnerRepo.findById(family.dinnerId);

    // Let's use the repository to get the full ORM entity for recovery
    const familyData = await (this.familyRepo as any).repository.findOne({
      where: { id: family.id },
      relations: ['people']
    });

    return {
      family: familyData,
      dinnerCode: dinner?.code
    };
  }

  /** Get a family with its people and orders — used by guests to refresh prices */
  @Get(':id')
  async getById(@Param('id') id: string) {
    const family = await (this.familyRepo as any).findByIdWithPeople(id);
    if (!family) throw new NotFoundException('Grupo no encontrado');
    return family;
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { phone: string }) {
    const family = await this.familyRepo.findById(id);
    if (!family) throw new NotFoundException('Grupo no encontrado');

    // Update phone
    const updated = { ...family, phone: body.phone } as any;
    await this.familyRepo.save(updated);
    return { success: true };
  }
}
