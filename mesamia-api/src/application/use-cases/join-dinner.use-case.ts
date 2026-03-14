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
  people: { name: string; phone: string }[];
}

@Injectable()
export class JoinDinnerUseCase {
  constructor(
    @Inject('IPersonRepository') private readonly personRepo: IPersonRepository,
    @Inject('IFamilyRepository') private readonly familyRepo: IFamilyRepository,
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(command: JoinDinnerCommand): Promise<any> {
    const family = Family.create(command.dinnerId, command.familyName);
    await this.familyRepo.save(family);

    const createdPeople: Person[] = [];
    for (const p of command.people) {
      const existing = await this.personRepo.findByPhone(p.phone);
      if (existing) throw new Error(`El número ${p.phone} ya está registrado`);

      const person = Person.create(family.id, p.name, p.phone);
      await this.personRepo.save(person);

      const order = Order.create(person.id);
      await this.orderRepo.save(order);
      
      createdPeople.push(person);
    }

    return {
      id: family.id,
      name: family.name,
      people: createdPeople.map(p => ({ id: p.id, name: p.name }))
    };
  }
}
