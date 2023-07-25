import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Pagination } from 'nestjs-typeorm-paginate';
import { MessageAccessGuard } from './api/middleware/message-access.guard';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { PaginationArgs } from '../dto/pagination.args';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ID } from '../types/id.type';
import { PaginatedMessage, Message } from './message.entity';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageInput } from './dto/update-message.input';

@Resolver()
export class MessagesResolver {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(GqlJwtAuthGuard)
  @Mutation((returns) => Message)
  createPost(
    @Args('createMessageDto') createMessageDto: CreateMessageDto,
    @CurrentUser() user,
  ): Promise<Message> {
    return this.messagesService.create(createMessageDto, user.userId);
  }

  @Query((returns) => PaginatedMessage)
  postsByUserId(
    @Args('userId', { type: () => Int }) userId: number,
    @Args() paginationArgs: PaginationArgs,
  ): Promise<Pagination<Message>> {
    return this.messagesService.findByUserId(userId, paginationArgs);
  }

  @Query((returns) => PaginatedMessage)
  posts(@Args() paginationArgs: PaginationArgs): Promise<Pagination<Message>> {
    return this.messagesService.findAll(paginationArgs);
  }

  @Query((returns) => Message)
  post(@Args('id', { type: () => Int }) id: number): Promise<Message> {
    return this.messagesService.findOne(id);
  }

  @UseGuards(MessageAccessGuard)
  @UseGuards(GqlJwtAuthGuard)
  @Mutation((returns) => Message)
  updatePost(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('updateMessageDto') updateMessageDto: UpdateMessageInput,
  ): Promise<Message> {
    return this.messagesService.update(id, updateMessageDto);
  }

  @UseGuards(MessageAccessGuard)
  @UseGuards(GqlJwtAuthGuard)
  @Mutation((returns) => ID)
  deletePost(@Args({ name: 'id', type: () => Int }) id: number): Promise<ID> {
    return this.messagesService.delete(id);
  }
}
