import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Pagination } from 'nestjs-typeorm-paginate';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationArgs } from '../common/dto/pagination.args';
import { ID } from '../common/types/id.type';
import { PostAccessGuard } from './api/middleware/post-access.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostInput } from './dto/update-post.input';
import { PaginatedPost, Post } from './post.entity';
import { PostsService } from './posts.service';

@Resolver()
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(GqlJwtAuthGuard)
  @Mutation((returns) => Post)
  createPost(
    @Args('createPostDto') createPostDto: CreatePostDto,
    @CurrentUser() user,
  ): Promise<Post> {
    return this.postsService.create(createPostDto, user.userId);
  }

  @Query((returns) => PaginatedPost)
  postsByUserId(
    @Args('userId', { type: () => Int }) userId: number,
    @Args() paginationArgs: PaginationArgs,
  ): Promise<Pagination<Post>> {
    return this.postsService.findByUserId(userId, paginationArgs);
  }

  @Query((returns) => PaginatedPost)
  posts(@Args() paginationArgs: PaginationArgs): Promise<Pagination<Post>> {
    return this.postsService.findAll(paginationArgs);
  }

  @Query((returns) => Post)
  post(@Args('id', { type: () => Int }) id: number): Promise<Post> {
    return this.postsService.findOne(id);
  }

  @UseGuards(PostAccessGuard)
  @UseGuards(GqlJwtAuthGuard)
  @Mutation((returns) => Post)
  updatePost(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('updatePostDto') updatePostDto: UpdatePostInput,
  ): Promise<Post> {
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(PostAccessGuard)
  @UseGuards(GqlJwtAuthGuard)
  @Mutation((returns) => ID)
  deletePost(@Args({ name: 'id', type: () => Int }) id: number): Promise<ID> {
    return this.postsService.delete(id);
  }
}
