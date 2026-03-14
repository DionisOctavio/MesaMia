import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DinnerOrmEntity } from './infrastructure/persistence/entities/dinner.orm-entity';
import { FamilyOrmEntity } from './infrastructure/persistence/entities/family.orm-entity';
import { PersonOrmEntity } from './infrastructure/persistence/entities/person.orm-entity';
import { OrderOrmEntity } from './infrastructure/persistence/entities/order.orm-entity';
import { OrganizerOrmEntity } from './infrastructure/persistence/entities/organizer.orm-entity';

import { DinnerController } from './infrastructure/controllers/dinner.controller';
import { OrderController } from './infrastructure/controllers/order.controller';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { FamilyController } from './infrastructure/controllers/family.controller';

import { CreateDinnerUseCase } from './application/use-cases/create-dinner.use-case';
import { JoinDinnerUseCase } from './application/use-cases/join-dinner.use-case';
import { UpdateDinnerUseCase } from './application/use-cases/update-dinner.use-case';
import { UpdateOrderUseCase } from './application/use-cases/update-order.use-case';
import { SignUpOrganizerUseCase } from './application/use-cases/signup-organizer.use-case';
import { LoginOrganizerUseCase } from './application/use-cases/login-organizer.use-case';

import { TypeOrmDinnerRepository } from './infrastructure/persistence/repositories/typeorm-dinner.repository';
import { TypeOrmFamilyRepository } from './infrastructure/persistence/repositories/typeorm-family.repository';
import { TypeOrmPersonRepository } from './infrastructure/persistence/repositories/typeorm-person.repository';
import { TypeOrmOrderRepository } from './infrastructure/persistence/repositories/typeorm-order.repository';
import { TypeOrmOrganizerRepository } from './infrastructure/persistence/repositories/typeorm-organizer.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'mesamia',
      entities: [DinnerOrmEntity, FamilyOrmEntity, PersonOrmEntity, OrderOrmEntity, OrganizerOrmEntity],
      synchronize: true, // Should be false in production proper
    }),
    TypeOrmModule.forFeature([
      DinnerOrmEntity,
      FamilyOrmEntity,
      PersonOrmEntity,
      OrderOrmEntity,
      OrganizerOrmEntity,
    ]),
    JwtModule.register({
      global: true,
      secret: 'SECRET_KEY_MESA_MIA', // Use env in real apps
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [DinnerController, OrderController, AuthController, FamilyController],
  providers: [
    CreateDinnerUseCase,
    JoinDinnerUseCase,
    UpdateOrderUseCase,
    SignUpOrganizerUseCase,
    LoginOrganizerUseCase,
    UpdateDinnerUseCase,
    { provide: 'IDinnerRepository', useClass: TypeOrmDinnerRepository },
    { provide: 'IFamilyRepository', useClass: TypeOrmFamilyRepository },
    { provide: 'IPersonRepository', useClass: TypeOrmPersonRepository },
    { provide: 'IOrderRepository', useClass: TypeOrmOrderRepository },
    { provide: 'IOrganizerRepository', useClass: TypeOrmOrganizerRepository },
  ],
})
export class AppModule {}
