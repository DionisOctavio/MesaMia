import * as crypto from 'crypto';

export class Person {
  constructor(
    public readonly id: string,
    public readonly familyId: string,
    public readonly name: string,
    public readonly phone: string,
  ) {}

  static create(familyId: string, name: string, phone: string): Person {
    return new Person(crypto.randomUUID(), familyId, name, phone);
  }
}
