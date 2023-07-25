import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerWinston } from '../logger/logger-winston.service';
import { MockUsersRepository } from '../users/testing/mock.users.repository';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { MockJwtService } from './testing/mock.jwt.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('a valid e-mail address and password have been passed - must return the user object', async () => {
      const email = 'test@test.com';
      const pass = 'test';
      expect(await authService.validateUser(email, pass)).toEqual({
        id: 1,
        username: 'test',
        email: 'test@test.com',
        role: 'user',
      });
    });

    it('invalid email address have been passed - must return null', async () => {
      const email = 'test@tt.com';
      const pass = 'test';
      expect(await authService.validateUser(email, pass)).toBeNull();
    });

    it('invalid password have been passed - must return null', async () => {
      const email = 'test@test.com';
      const pass = 'tst';
      expect(await authService.validateUser(email, pass)).toBeNull();
    });
  });

  describe('facebookLogin', () => {
    it('user with stored e-mail address and facebookId have been passed - must return a object with field "accessToken"', async () => {
      const user = {
        email: 'test@test.com',
        facebookId: '00000007',
      };
      usersService.findOne = jest.fn().mockReturnValueOnce({
        id: 1,
        username: 'test',
        email: 'test@test.com',
        facebookId: '00000007',
        password:
          '$2b$10$nZ.K1fV4RBk4gnTGllG9K.MxcE7soABYLrHDYyokNYCoWC8JWIomu',
      });
      usersService.update = jest.fn();
      usersService.findOneByFacebookId = jest.fn();
      usersService.create = jest.fn();

      expect(await authService.facebookLogin(user)).toHaveProperty(
        'accessToken',
      );
      expect(usersService.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.update).toHaveBeenCalledTimes(0);
      expect(usersService.findOneByFacebookId).toHaveBeenCalledTimes(0);
      expect(usersService.create).toHaveBeenCalledTimes(0);
    });

    it('user with stored e-mail address but unstored facebookId have been passed - must return a object with field "accessToken"', async () => {
      const user = {
        email: 'test@test.com',
        facebookId: '00000008',
      };
      usersService.findOne = jest.fn().mockReturnValueOnce({
        id: 1,
        username: 'test',
        email: 'test@test.com',
        password:
          '$2b$10$nZ.K1fV4RBk4gnTGllG9K.MxcE7soABYLrHDYyokNYCoWC8JWIomu',
      });
      usersService.update = jest.fn();
      usersService.findOneByFacebookId = jest.fn();
      usersService.create = jest.fn();

      expect(await authService.facebookLogin(user)).toHaveProperty(
        'accessToken',
      );
      expect(usersService.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.update).toHaveBeenCalledTimes(1);
      expect(usersService.findOneByFacebookId).toHaveBeenCalledTimes(0);
      expect(usersService.create).toHaveBeenCalledTimes(0);
    });

    it('user with unstored email address but stored facebookId have been passed - must return a object with field "accessToken"', async () => {
      const user = {
        email: 'test2@test.com',
        facebookId: '00000007',
      };
      usersService.findOne = jest.fn().mockReturnValueOnce(null);
      usersService.update = jest.fn();
      usersService.findOneByFacebookId = jest.fn().mockReturnValueOnce({
        id: 2,
        username: 'test',
        email: 'test@test.com',
        facebookId: '00000007',
        password:
          '$2b$10$nZ.K1fV4RBk4gnTGllG9K.MxcE7soABYLrHDYyokNYCoWC8JWIomu',
      });
      usersService.create = jest.fn();

      expect(await authService.facebookLogin(user)).toHaveProperty(
        'accessToken',
      );
      expect(usersService.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.update).toHaveBeenCalledTimes(0);
      expect(usersService.findOneByFacebookId).toHaveBeenCalledTimes(1);
      expect(usersService.create).toHaveBeenCalledTimes(0);
    });

    it('user with unstored email address and facebookId have been passed - must return a object with field "accessToken"', async () => {
      const user = {
        email: 'test3@test.com',
        facebookId: '00000008',
        username: 'test',
      };
      usersService.findOne = jest.fn().mockReturnValueOnce(null);
      usersService.update = jest.fn();
      usersService.findOneByFacebookId = jest.fn().mockReturnValueOnce(null);
      usersService.create = jest.fn().mockReturnValueOnce({
        id: 3,
        username: 'test',
        email: 'test3@test.com',
        facebookId: '00000008',
      });

      expect(await authService.facebookLogin(user)).toHaveProperty(
        'accessToken',
      );
      expect(usersService.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.update).toHaveBeenCalledTimes(0);
      expect(usersService.findOneByFacebookId).toHaveBeenCalledTimes(1);
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('user have been passed - must return a object with field "accessToken"', async () => {
      const user = { id: 1, email: 'test@test.com' };
      expect(await authService.login(user)).toHaveProperty('accessToken');
    });
  });

  describe('register', () => {
    it('createUserDto have been passed - must return a user object', async () => {
      const createUserDto = {
        username: 'test',
        password: 'test',
        email: 'test@test.com',
      };
      expect(await authService.register({ ...createUserDto })).toHaveProperty(
        'id',
      );
      expect(await authService.register({ ...createUserDto })).toHaveProperty(
        'username',
        'test',
      );
      expect(await authService.register({ ...createUserDto })).toHaveProperty(
        'email',
        'test@test.com',
      );
    });
  });
});
