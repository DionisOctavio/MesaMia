import { Organizer } from '../entities/organizer.entity';

export interface IOrganizerRepository {
  save(organizer: Organizer): Promise<void>;
  findByPhone(phone: string): Promise<Organizer | null>;
  findById(id: string): Promise<Organizer | null>;
}
