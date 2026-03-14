import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { IOrganizerRepository } from '../../domain/repositories/organizer.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginOrganizerUseCase {
  constructor(
    @Inject('IOrganizerRepository')
    private readonly organizerRepo: IOrganizerRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(phone: string, passwordPlain: string): Promise<{ accessToken: string, organizerId: string }> {
    const organizer = await this.organizerRepo.findByPhone(phone);
    if (!organizer) throw new Error('Credenciales inválidas');

    const isMatch = await bcrypt.compare(passwordPlain, organizer.password);
    if (!isMatch) throw new Error('Credenciales inválidas');

    const payload = { sub: organizer.id, phone: organizer.phone };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      organizerId: organizer.id,
    };
  }
}
