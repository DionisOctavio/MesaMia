import { Body, Controller, Post, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { SignUpOrganizerUseCase } from '../../application/use-cases/signup-organizer.use-case';
import { LoginOrganizerUseCase } from '../../application/use-cases/login-organizer.use-case';
import type { IOrganizerRepository } from '../../domain/repositories/organizer.repository';
import type { IDinnerRepository } from '../../domain/repositories/dinner.repository';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignUpOrganizerUseCase,
    private readonly loginUseCase: LoginOrganizerUseCase,
    @Inject('IOrganizerRepository') private readonly organizerRepo: IOrganizerRepository,
    @Inject('IDinnerRepository') private readonly dinnerRepo: IDinnerRepository,
  ) {}

  @Post('signup')
  async signup(@Body() body: any) {
    return this.signupUseCase.execute(body.phone, body.password);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.loginUseCase.execute(body.phone, body.password);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { phone: string; dinnerCode: string; newPassword: string }) {
    const organizer = await this.organizerRepo.findByPhone(body.phone);
    if (!organizer) throw new NotFoundException('Organizador no encontrado');

    const dinner = await this.dinnerRepo.findByCode(body.dinnerCode);
    if (!dinner) throw new BadRequestException('Código de cena no válido');

    // Check if organizer is owner/collaborator of this dinner
    const isOwner = (dinner.organizers || []).some((o: any) => o.id === organizer.id);
    if (!isOwner) throw new BadRequestException('El código de cena no pertenece a este organizador');

    // Update password
    const hashedPassword = await bcrypt.hash(body.newPassword, 10);
    const updated = { ...organizer, password: hashedPassword } as any;
    await this.organizerRepo.save(updated);

    return { success: true, message: 'Contraseña actualizada correctamente' };
  }
}
