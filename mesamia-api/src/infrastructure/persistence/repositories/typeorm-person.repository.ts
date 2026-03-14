import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../../../domain/entities/person.entity';
import { IPersonRepository } from '../../../domain/repositories/person.repository';
import { PersonOrmEntity } from '../entities/person.orm-entity';

@Injectable()
export class TypeOrmPersonRepository implements IPersonRepository {
  constructor(
    @InjectRepository(PersonOrmEntity)
    private readonly repository: Repository<PersonOrmEntity>,
  ) {}

  async save(person: Person): Promise<void> {
    const ormEntity = this.repository.create(person);
    await this.repository.save(ormEntity);
  }

  async findByPhone(phone: string): Promise<Person | null> {
    const e = await this.repository.findOne({ where: { phone } });
    if (!e) return null;
    return new Person(e.id, e.familyId, e.name, e.phone);
  }

  async findByFamilyId(familyId: string): Promise<Person[]> {
    const entities = await this.repository.find({ where: { familyId } });
    return entities.map(e => new Person(e.id, e.familyId, e.name, e.phone));
  }
}
