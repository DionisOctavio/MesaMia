import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organizer } from '../../../domain/entities/organizer.entity';
import { IOrganizerRepository } from '../../../domain/repositories/organizer.repository';
import { OrganizerOrmEntity } from '../entities/organizer.orm-entity';

@Injectable()
export class TypeOrmOrganizerRepository implements IOrganizerRepository {
  constructor(
    @InjectRepository(OrganizerOrmEntity)
    private readonly repository: Repository<OrganizerOrmEntity>,
  ) {}

  async save(organizer: Organizer): Promise<void> {
    const ormEntity = this.repository.create({
      id: organizer.id,
      phone: organizer.phone,
      password: organizer.password,
    } as any);
    await this.repository.save(ormEntity);
  }

  async findByPhone(phone: string): Promise<Organizer | null> {
    const ormEntity = await this.repository.findOneBy({ phone });
    if (!ormEntity) return null;
    return new Organizer(ormEntity.id, ormEntity.phone, ormEntity.password);
  }

  async findById(id: string): Promise<Organizer | null> {
    const ormEntity = await this.repository.findOneBy({ id });
    if (!ormEntity) return null;
    return new Organizer(ormEntity.id, ormEntity.phone, ormEntity.password);
  }
}
