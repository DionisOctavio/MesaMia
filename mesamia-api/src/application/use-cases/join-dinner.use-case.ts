import { Inject, Injectable } from '@nestjs/common';
import { Person } from '../../domain/entities/person.entity';
import { Family } from '../../domain/entities/family.entity';
import { Order } from '../../domain/entities/order.entity';
import type { IPersonRepository } from '../../domain/repositories/person.repository';
import type { IFamilyRepository } from '../../domain/repositories/family.repository';
import type { IOrderRepository } from '../../domain/repositories/order.repository';

export interface JoinDinnerCommand {
  dinnerId: string;
  familyName: string;
  phone: string;
  people: { name: string }[];
}

@Injectable()
export class JoinDinnerUseCase {
  constructor(
    @Inject('IPersonRepository') private readonly personRepo: IPersonRepository,
    @Inject('IFamilyRepository') private readonly familyRepo: IFamilyRepository,
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: JoinDinnerCommand): Promise<any> {
    const existingFamily = await this.familyRepo.findByPhone(command.phone);
    if (existingFamily && existingFamily.dinnerId === command.dinnerId) {
      throw new Error(`Este número de teléfono ya está registrado en esta cena`);
    }

    const family = Family.create(command.dinnerId, command.familyName, command.phone);
    await this.familyRepo.save(family);

    const createdPeople: Person[] = [];
    for (const p of command.people) {
      const person = Person.create(family.id, p.name);
      await this.personRepo.save(person);

      const order = Order.create(person.id);
      await this.orderRepo.save(order);
      
      createdPeople.push(person);
    }

    return {
      id: family.id,
      name: family.name,
      phone: family.phone,
      people: createdPeople.map(p => ({ id: p.id, name: p.name }))
    };
  }
}
