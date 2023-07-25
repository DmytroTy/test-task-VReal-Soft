import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { Role } from '../enums/role.enum';
import { ID } from '../types/id.type';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.save(createUserDto);
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<User>> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .orderBy('user.id', 'DESC');

    return paginate<User>(queryBuilder, options);
  }

  async findOne(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneByFacebookId(facebookId: string): Promise<User> {
    return this.usersRepository.findOne({ where: { facebookId } });
  }

  async update(id: number, updateUserDto: UpdateUserDto, user): Promise<User> {
    if (updateUserDto.password) {
      const saltOrRounds = 10;
      const pass = updateUserDto.password;
      updateUserDto.password = await bcrypt.hash(pass, saltOrRounds);
    }

    if (user.role === Role.ADMIN) {
      return this.usersRepository.save({ ...updateUserDto, id });
    }

    if (id !== user.userId) {
      return this.usersRepository.save({ ...updateUserDto, id: user.userId });
    }
  }

  async changeRole(
    id: number,
    changeUserRoleDto: ChangeUserRoleDto,
  ): Promise<User> {
    return this.usersRepository.save({ ...changeUserRoleDto, id });
  }

  async delete(id: number): Promise<ID> {
    await this.usersRepository.softDelete(id);
    return { id };
  }
}
