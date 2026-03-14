import { Dinner } from '../entities/dinner.entity';

export interface IDinnerRepository {
  save(dinner: Dinner): Promise<void>;
  findByCode(code: string): Promise<any | null>;
  findByAdminCode(adminCode: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  findByOrganizerId(organizerId: string): Promise<any[]>;
  delete(id: string): Promise<void>;
}
