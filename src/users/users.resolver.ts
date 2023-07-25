import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Pagination } from 'nestjs-typeorm-paginate';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { PaginationArgs } from '../dto/pagination.args';
import { Role } from '../enums/role.enum';
import { ID } from '../types/id.type';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { UpdateUserInput } from './dto/update-user.input';
import { PaginatedUser, User } from './user.entity';
import { UsersService } from './users.service';

@Resolver()
@UseGuards(GqlJwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Query((returns) => PaginatedUser)
  users(@Args() paginationArgs: PaginationArgs): Promise<Pagination<User>> {
    return this.usersService.findAll(paginationArgs);
  }

  @Mutation((returns) => User, { name: 'updateProfile' })
  updateUser(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('updateUserDto') updateUserDto: UpdateUserInput,
    @CurrentUser() user,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto, user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation((returns) => User)
  changeUserRole(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('changeUserRoleDto') changeUserRoleDto: ChangeUserRoleDto,
  ): Promise<User> {
    return this.usersService.changeRole(id, changeUserRoleDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Mutation((returns) => ID)
  deleteUser(@Args({ name: 'id', type: () => Int }) id: number): Promise<ID> {
    return this.usersService.delete(id);
  }
}
