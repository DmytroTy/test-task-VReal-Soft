import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UpdateResult } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { ChangeUserRoleDto } from './dto/change-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedUser, User } from './user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOkResponse({
    description: 'Get posts.',
    type: PaginatedUser,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  @ApiForbiddenResponse({ description: 'Access forbidden!' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    return this.usersService.findAll({
      page,
      limit,
      route: '/users',
    });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('change-role/:id')
  @ApiOkResponse({
    description: 'The user role has been successfully updated.',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  @ApiForbiddenResponse({ description: 'Access forbidden!' })
  changeRole(
    @Param('id') id: number,
    @Body() changeUserRoleDto: ChangeUserRoleDto,
  ): Promise<User> {
    return this.usersService.changeRole(id, changeUserRoleDto);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'The record of user has been successfully updated.',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The user has been successfully deleted.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  @ApiForbiddenResponse({ description: 'Access forbidden!' })
  delete(@Param('id') id: number): Promise<UpdateResult> {
    return this.usersService.delete(id);
  }
}
