import { Role } from '../../common/enums/role.enum';
import { User } from '../user.entity';

export class MockUsersRepository {
  async findOne(argument): Promise<User> {
    if (argument.where.email === 'test@test.com') {
      return Object.assign(
        {},
        {
          id: 1,
          username: 'test',
          email: 'test@test.com',
          password:
            '$2b$10$nZ.K1fV4RBk4gnTGllG9K.MxcE7soABYLrHDYyokNYCoWC8JWIomu',
          role: Role.USER,
        },
      );
    }

    return null;
  }

  save(createUserDto) {
    createUserDto.id = 3;
    return createUserDto;
  }
}
