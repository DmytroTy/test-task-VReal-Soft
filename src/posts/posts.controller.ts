import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post as PostHttp,
  Query,
  Request,
  UseGuards,
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
import { ID } from '../common/types/id.type';
import { PostAccessGuard } from './api/middleware/post-access.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatedPost, Post } from './post.entity';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @PostHttp()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The record of new post has been successfully created.',
    type: Post,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  create(@Body() createPostDto: CreatePostDto, @Request() req): Promise<Post> {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get(':userId')
  @ApiOkResponse({
    description: 'Get posts by userId.',
    type: PaginatedPost,
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findByUserId(
    @Param('userId') userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Post>> {
    limit = limit > 100 ? 100 : limit;
    return this.postsService.findByUserId(userId, {
      page,
      limit,
      route: `/posts/${userId}`,
    });
  }

  @Get()
  @ApiOkResponse({
    description: 'Get posts.',
    type: PaginatedPost,
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Post>> {
    limit = limit > 100 ? 100 : limit;
    return this.postsService.findAll({
      page,
      limit,
      route: '/posts',
    });
  }

  @UseGuards(PostAccessGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The record of post has been successfully updated.',
    type: Post,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized forbidden!' })
  @ApiForbiddenResponse({ description: 'Access forbidden!' })
  update(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    return this.postsService.update(id, updatePostDto);
  }

  @UseGuards(PostAccessGuard)
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
    return this.postsService.delete(id);
  }
}
