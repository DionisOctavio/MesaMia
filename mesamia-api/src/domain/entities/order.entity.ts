import * as crypto from 'crypto';

export class Order {
  constructor(
    public readonly id: string,
    public readonly personId: string,
    public starter: string,
    public main: string,
    public dessert: string,
    public drink: string,
    public cartaItems: string = '[]', // JSON string for multiple Carta items
  ) {}

  static create(
    personId: string, 
    starter: string = '', 
    main: string = '', 
    dessert: string = '', 
    drink: string = '',
    cartaItems: string = '[]'
  ): Order {
    return new Order(crypto.randomUUID(), personId, starter, main, dessert, drink, cartaItems);
  }
}
