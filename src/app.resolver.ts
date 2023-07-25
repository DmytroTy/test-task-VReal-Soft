import {
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { AuthService } from './auth/auth.service';
import { GqlJwtAuthGuard } from './auth/guards/gql-jwt-auth.guard';
import { GqlLocalAuthGuard } from './auth/guards/gql-local-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './users/user.entity';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UsersService } from './users/users.service';
import { LoginInput } from './dto/login.input';

@ObjectType({ description: 'Success login response data' })
class LoginResult {
  @Field()
  accessToken: string;
}

@Resolver()
export class AppResolver {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(GqlLocalAuthGuard)
  @Mutation((returns) => LoginResult)
  login(@Args('loginDto') loginDto: LoginInput, @CurrentUser() user: User) {
    // loginDto is used only by GqlLocalAuthGuard but not directly in this method
    return this.authService.login(user);
  }

  @Mutation((returns) => User)
  @UseInterceptors(ClassSerializerInterceptor)
  register(@Args('createUserDto') createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query((returns) => User, { name: 'profile' })
  @UseInterceptors(ClassSerializerInterceptor)
  getProfile(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findOne(user.email);
  }
}
