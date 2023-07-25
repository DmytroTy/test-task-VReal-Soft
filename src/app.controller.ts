import {
  Controller,
  Body,
  Get,
  Req,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { User } from './users/user.entity';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UsersService } from './users/users.service';

@ApiTags('auth')
@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiCreatedResponse({
    description: 'User successfully logined.',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
      },
    },
  })
  async login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'The record of new user has been successfully created.',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiConflictResponse({
    description: 'A user with this email already exists!',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(AuthGuard('facebook'))
  @Get('/facebook')
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @UseGuards(AuthGuard('facebook'))
  @Get('/facebook/redirect')
  @ApiCreatedResponse({
    description: 'User successfully logined by facebook.',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
      },
    },
  })
  async facebookLoginRedirect(@Req() req: Request): Promise<any> {
    return this.authService.facebookLogin(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get profile.',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  async getProfile(@Req() req): Promise<User> {
    return this.usersService.findOne(req.user.email);
  }
}
