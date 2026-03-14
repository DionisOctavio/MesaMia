import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Organizer } from '../../domain/entities/organizer.entity';
import type { IOrganizerRepository } from '../../domain/repositories/organizer.repository';

@Injectable()
export class SignUpOrganizerUseCase {
  constructor(
    @Inject('IOrganizerRepository')
    private readonly organizerRepo: IOrganizerRepository,
  ) {}

  async execute(phone: string, passwordPlain: string): Promise<Organizer> {
    const existing = await this.organizerRepo.findByPhone(phone);
    if (existing) throw new Error('Ya existe un organizador con este teléfono');

    const hashedPassword = await bcrypt.hash(passwordPlain, 10);
    const organizer = Organizer.create(phone, hashedPassword);
    await this.organizerRepo.save(organizer);
    return organizer;
  }
}
