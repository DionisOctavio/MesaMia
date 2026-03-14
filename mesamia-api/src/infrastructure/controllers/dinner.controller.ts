import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards, Request, NotFoundException, Inject, ForbiddenException } from '@nestjs/common';
import { CreateDinnerUseCase } from '../../application/use-cases/create-dinner.use-case';
import { JoinDinnerUseCase } from '../../application/use-cases/join-dinner.use-case';
import { UpdateDinnerUseCase } from '../../application/use-cases/update-dinner.use-case';
import { Dinner, DinnerMode } from '../../domain/entities/dinner.entity';
import type { CreateDinnerCommand } from '../../application/use-cases/create-dinner.use-case';
import type { JoinDinnerCommand } from '../../application/use-cases/join-dinner.use-case';
import type { UpdateDinnerCommand } from '../../application/use-cases/update-dinner.use-case';
import type { IDinnerRepository } from '../../domain/repositories/dinner.repository';
import { AuthGuard } from '../auth/auth.guard';

@Controller('dinners')
export class DinnerController {
  constructor(
    private readonly createDinnerUseCase: CreateDinnerUseCase,
    private readonly joinDinnerUseCase: JoinDinnerUseCase,
    private readonly updateDinnerUseCase: UpdateDinnerUseCase,
    @Inject('IDinnerRepository')
    private readonly dinnerRepository: IDinnerRepository,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() body: CreateDinnerCommand, @Request() req: any) {
    const organizerId = req.user.sub;
    return this.createDinnerUseCase.execute({ ...body, organizerIds: [organizerId] });
  }

  @UseGuards(AuthGuard)
  @Patch(':code')
  async update(@Param('code') code: string, @Body() body: Partial<UpdateDinnerCommand>, @Request() req: any) {
    const organizerId = req.user.sub;
    return this.updateDinnerUseCase.execute({ ...body, code, organizerId } as any);
  }

  /** List all dinners for the logged-in organizer */
  @UseGuards(AuthGuard)
  @Get()
  async getMyDinners(@Request() req: any) {
    const organizerId = req.user.sub;
    return this.dinnerRepository.findByOrganizerId(organizerId);
  }

  @Post('join')
  async join(@Body() body: JoinDinnerCommand) {
    return this.joinDinnerUseCase.execute(body);
  }

  /** Añadirse como co-organizador usando el código de admin */
  @UseGuards(AuthGuard)
  @Post(':code/add-organizer')
  async addOrganizer(@Param('code') code: string, @Request() req: any) {
    const organizerId = req.user.sub;
    const dbDinner = await this.dinnerRepository.findByCode(code) as any;
    if (!dbDinner) throw new NotFoundException('Cena no encontrada');

    const existingIds: string[] = (dbDinner.organizers || []).map((o: any) => o.id);
    if (existingIds.includes(organizerId)) {
      return { message: 'Ya eres organizador de esta cena', code };
    }

    const updatedDinner = new Dinner(
      dbDinner.id, dbDinner.name, dbDinner.restaurant, new Date(dbDinner.date),
      dbDinner.menuPrice, dbDinner.code, dbDinner.starters, dbDinner.mains,
      dbDinner.desserts, dbDinner.drinks, dbDinner.mode as any,
      dbDinner.cartaProducts, [...existingIds, organizerId], dbDinner.adminCode
    );
    await this.dinnerRepository.save(updatedDinner);
    return { message: 'Añadido como co-organizador', code };
  }

  /** Buscar cena por código de admin (sin auth → muestra info básica para que el collab pueda loguarse) */
  @Get('admin/:adminCode')
  async getByAdminCode(@Param('adminCode') adminCode: string) {
    const dinner = await this.dinnerRepository.findByAdminCode(adminCode);
    if (!dinner) throw new NotFoundException('Código de organizador no válido');
    // Devolvemos solo info básica + el code NORMAL (no el adminCode) para el redirect posterior
    return {
      id: dinner.id,
      name: dinner.name,
      restaurant: dinner.restaurant,
      date: dinner.date,
      code: dinner.code,
      isAdminCode: true,
    };
  }

  @Get(':code')
  async getByCode(@Param('code') code: string) {
    const dinner = await this.dinnerRepository.findByCode(code);
    if (!dinner) throw new NotFoundException('Cena no encontrada');
    return dinner;
  }

  @UseGuards(AuthGuard)
  @Delete(':code')
  async deleteDinner(@Param('code') code: string, @Request() req: any) {
    const organizerId = req.user.sub;
    const dinner = await this.dinnerRepository.findByCode(code) as any;
    if (!dinner) throw new NotFoundException('Cena no encontrada');
    const isOrganizer = (dinner.organizers || []).some((o: any) => o.id === organizerId);
    if (!isOrganizer) throw new ForbiddenException('No tienes permiso para eliminar esta cena');
    await this.dinnerRepository.delete(dinner.id);
    return { message: 'Cena eliminada correctamente' };
  }
}
