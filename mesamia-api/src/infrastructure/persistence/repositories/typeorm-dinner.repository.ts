import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dinner, DinnerMode } from '../../../domain/entities/dinner.entity';
import { IDinnerRepository } from '../../../domain/repositories/dinner.repository';
import { DinnerOrmEntity } from '../entities/dinner.orm-entity';

@Injectable()
export class TypeOrmDinnerRepository implements IDinnerRepository {
  constructor(
    @InjectRepository(DinnerOrmEntity)
    private readonly repository: Repository<DinnerOrmEntity>,
  ) {}

  async save(dinner: Dinner): Promise<void> {
    const ormEntity = this.repository.create({
      id: dinner.id,
      name: dinner.name,
      restaurant: dinner.restaurant,
      date: dinner.date,
      menuPrice: dinner.menuPrice,
      code: dinner.code,
      starters: dinner.starters,
      mains: dinner.mains,
      desserts: dinner.desserts,
      drinks: dinner.drinks,
      mode: dinner.mode,
      cartaProducts: dinner.cartaProducts,
      adminCode: dinner.adminCode,
      organizers: dinner.organizerIds.map(id => ({ id }))
    } as any);
    await this.repository.save(ormEntity);
  }

  async findByCode(code: string): Promise<any | null> {
    return this.repository.findOne({ 
      where: { code },
      relations: ['families', 'families.people', 'families.people.order', 'organizers']
    });
  }

  async findById(id: string): Promise<Dinner | null> {
    const ormEntity = await this.repository.findOne({ 
      where: { id },
      relations: ['organizers']
    });
    if (!ormEntity) return null;
    return new Dinner(
      ormEntity.id, 
      ormEntity.name, 
      ormEntity.restaurant, 
      ormEntity.date, 
      ormEntity.menuPrice, 
      ormEntity.code,
      ormEntity.starters,
      ormEntity.mains,
      ormEntity.desserts,
      ormEntity.drinks,
      ormEntity.mode as DinnerMode,
      ormEntity.cartaProducts,
      (ormEntity.organizers || []).map(o => o.id),
      ormEntity.adminCode
    );
  }

  async findByAdminCode(adminCode: string): Promise<any | null> {
    return this.repository.findOne({ 
      where: { adminCode },
      relations: ['families', 'families.people', 'families.people.order', 'organizers']
    });
  }

  async findByOrganizerId(organizerId: string): Promise<any[]> {
    // Use query builder for ManyToMany filter
    return this.repository
      .createQueryBuilder('dinner')
      .innerJoin('dinner.organizers', 'org', 'org.id = :organizerId', { organizerId })
      .leftJoinAndSelect('dinner.families', 'family')
      .leftJoinAndSelect('family.people', 'person')
      .leftJoinAndSelect('dinner.organizers', 'organizer')
      .orderBy('dinner.date', 'DESC')
      .getMany();
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
