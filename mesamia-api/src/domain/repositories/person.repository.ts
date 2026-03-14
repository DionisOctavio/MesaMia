import { Person } from '../entities/person.entity';

export interface IPersonRepository {
  save(person: Person): Promise<void>;
  findByFamilyId(familyId: string): Promise<Person[]>;
}
