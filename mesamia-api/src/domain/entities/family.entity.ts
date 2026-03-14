import * as crypto from 'crypto';

export class Family {
  constructor(
    public readonly id: string,
    public readonly dinnerId: string,
    public readonly name: string,
  ) {}

  static create(dinnerId: string, name: string): Family {
    return new Family(crypto.randomUUID(), dinnerId, name);
  }
}
