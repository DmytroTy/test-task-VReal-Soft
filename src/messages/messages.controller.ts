import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  Delete,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ID } from '../types/id.type';
import { MessageAccessGuard } from './api/middleware/message-access.guard';
import { PaginatedMessage, Message } from './message.entity';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiTags('posts')
@Controller('posts')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The record of new post has been successfully created.',
    type: Message,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  create(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ): Promise<Message> {
    return this.messagesService.create(createMessageDto, req.user.userId);
  }

  @Get(':userId')
  @ApiOkResponse({
    description: 'Get posts by userId.',
    type: PaginatedMessage,
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findByUserId(
    @Param('userId') userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Message>> {
    limit = limit > 100 ? 100 : limit;
    return this.messagesService.findByUserId(userId, {
      page,
      limit,
      route: `/posts/${userId}`,
    });
  }

  @Get()
  @ApiOkResponse({
    description: 'Get posts.',
    type: PaginatedMessage,
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Message>> {
    limit = limit > 100 ? 100 : limit;
    return this.messagesService.findAll({
      page,
      limit,
      route: '/posts',
    });
  }

  @UseGuards(MessageAccessGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The record of post has been successfully updated.',
    type: Message,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  @ApiForbiddenResponse({ description: 'Access forbidden!' })
  update(
    @Param('id') id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messagesService.update(id, updateMessageDto);
  }

  @UseGuards(MessageAccessGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The record of post has been successfully deleted.',
    type: ID,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  @ApiForbiddenResponse({ description: 'Access forbidden!' })
  delete(@Param('id') id: number): Promise<ID> {
    return this.messagesService.delete(id);
  }
}
