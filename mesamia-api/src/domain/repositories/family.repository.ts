import { Family } from '../entities/family.entity';

export interface IFamilyRepository {
  save(family: Family): Promise<void>;
  findByDinnerId(dinnerId: string): Promise<Family[]>;
  delete(id: string): Promise<void>;
  findByPhone(phone: string): Promise<Family | null>;
  findByPersonPhone(phone: string): Promise<Family | null>;
}
