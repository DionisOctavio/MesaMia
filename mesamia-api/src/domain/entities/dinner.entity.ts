import * as crypto from 'crypto';

export enum DinnerMode {
  MENU = 'MENU',
  CARTA = 'CARTA'
}

export class Dinner {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly restaurant: string,
    public readonly date: Date,
    public readonly menuPrice: string,
    public readonly code: string,
    public readonly starters: string,
    public readonly mains: string,
    public readonly desserts: string,
    public readonly drinks: string,
    public readonly mode: DinnerMode = DinnerMode.MENU,
    public readonly cartaProducts: string = '[]',
    public readonly organizerIds: string[] = [],
    public readonly adminCode: string = '',
  ) {}

  static create(
    name: string, 
    restaurant: string, 
    date: Date, 
    menuPrice: string, 
    starters: string, 
    mains: string, 
    desserts: string, 
    drinks: string,
    mode: DinnerMode = DinnerMode.MENU,
    cartaProducts: string = '[]',
    organizerIds: string[] = [],
  ): Dinner {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const adminCode = 'A-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    return new Dinner(
      crypto.randomUUID(), 
      name, 
      restaurant, 
      date, 
      menuPrice, 
      code, 
      starters, 
      mains, 
      desserts, 
      drinks,
      mode,
      cartaProducts,
      organizerIds,
      adminCode
    );
  }
}
