import { Person } from '../entities/person.entity';

export interface IPersonRepository {
  save(person: Person): Promise<void>;
  findByPhone(phone: string): Promise<Person | null>;
  findByFamilyId(familyId: string): Promise<Person[]>;
}
