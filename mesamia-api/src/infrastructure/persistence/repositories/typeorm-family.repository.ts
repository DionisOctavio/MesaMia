import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from '../../../domain/entities/family.entity';
import { IFamilyRepository } from '../../../domain/repositories/family.repository';
import { FamilyOrmEntity } from '../entities/family.orm-entity';

@Injectable()
export class TypeOrmFamilyRepository implements IFamilyRepository {
  constructor(
    @InjectRepository(FamilyOrmEntity)
    private readonly repository: Repository<FamilyOrmEntity>,
  ) {}

  async save(family: Family): Promise<void> {
    const ormEntity = this.repository.create(family);
    await this.repository.save(ormEntity);
  }

  async findByDinnerId(dinnerId: string): Promise<Family[]> {
    const entities = await this.repository.find({ 
      where: { dinnerId },
      relations: ['people', 'people.order']
    });
    return entities.map(e => new Family(e.id, e.dinnerId, e.name, e.phone));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByPhone(phone: string): Promise<Family | null> {
    const e = await this.repository.findOne({ where: { phone } });
    if (!e) return null;
    return new Family(e.id, e.dinnerId, e.name, e.phone);
  }

  async findByPersonPhone(phone: string): Promise<Family | null> {
    // This now probably means find by group phone as people don't have phones anymore
    return this.findByPhone(phone);
  }
}
