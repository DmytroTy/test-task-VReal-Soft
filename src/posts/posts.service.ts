import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { ID } from '../common/types/id.type';
import { LoggerWinston } from '../logger/logger-winston.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly logger: LoggerWinston,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    return this.postsRepository.save({
      user: { id: userId },
      ...createPostDto,
    });
  }

  async findByUserId(
    userId: number,
    options: IPaginationOptions,
  ): Promise<Pagination<Post>> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .where('post.userId = :userId', { userId })
      .orderBy('post.id', 'DESC');

    return paginate<Post>(queryBuilder, options);
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<Post>> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .orderBy('post.id', 'DESC');

    return paginate<Post>(queryBuilder, options);
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      this.logger.warn(
        `User error: Post with id = ${id} not found.`,
        'PostsService',
      );
      throw new NotFoundException();
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    return this.postsRepository.save({ id, ...updatePostDto });
  }

  async delete(id: number): Promise<ID> {
    await this.postsRepository.delete(id);
    return { id };
  }
}
