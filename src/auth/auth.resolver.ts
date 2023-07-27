import {
  ClassSerializerInterceptor,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Args, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LoginInput } from '../common/dto/login.input';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { GqlLocalAuthGuard } from './guards/gql-local-auth.guard';

@ObjectType({ description: 'Success login response data' })
class LoginResult {
  @Field()
  accessToken: string;
}

@Resolver()
export class AuthResolver {
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
}
