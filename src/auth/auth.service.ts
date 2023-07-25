import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoggerWinston } from '../logger/logger-winston.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

const POSTGRES_ERROR_CODE_DUPLICATE_KEY_VALUE = '23505';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly logger: LoggerWinston,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    const isMatch = user ? await bcrypt.compare(pass, user.password) : false;

    if (isMatch) {
      delete user.password;
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, role: user.role, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async facebookLogin(client: any) {
    let user = await this.usersService.findOne(client.email);
    if (user && !user.facebookId) {
      await this.usersService.update(
        user.id,
        { facebookId: client.facebookId },
        user.id,
      );
    }

    if (!user) {
      user = await this.usersService.findOneByFacebookId(client.facebookId);
    }

    if (!user) {
      user = await this.usersService.create({
        email: client.email,
        username: client.firstName,
        facebookId: client.facebookId,
      });
    }

    const payload = { email: user.email, role: user.role, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const pass = createUserDto.password;
    createUserDto.password = await bcrypt.hash(pass, saltOrRounds);

    let user: User;
    try {
      user = await this.usersService.create(createUserDto);
      delete user.password;
      delete user.deletedAt;
    } catch (err) {
      if (err.code === POSTGRES_ERROR_CODE_DUPLICATE_KEY_VALUE) {
        this.logger.warn(`User error: ${err.message}`, 'AuthService');
        throw new ConflictException('A user with this email already exists!');
      }
      this.logger.error(`Important error: ${err.message}`, 'AuthService', err);
      throw new InternalServerErrorException(
        'Failed to create user account, please try again later.',
      );
    }

    return user;
  }
}
