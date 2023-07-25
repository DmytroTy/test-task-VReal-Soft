import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';
import { User } from './users/user.entity';
import { UsersService } from './users/users.service';
import { MockUsersRepository } from './users/testing/mock.users.repository';
import { LoggerWinston } from './logger/logger-winston.service';
import { MockJwtService } from './auth/testing/mock.jwt.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        ConfigService,
        LoggerWinston,
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: MockUsersRepository,
        },
        {
          provide: JwtService,
          useClass: MockJwtService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });
});
