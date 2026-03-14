import * as crypto from 'crypto';

export class Organizer {
  constructor(
    public readonly id: string,
    public readonly phone: string,
    public password: string,
  ) {}

  static create(phone: string, passwordHashed: string): Organizer {
    return new Organizer(crypto.randomUUID(), phone, passwordHashed);
  }
}
