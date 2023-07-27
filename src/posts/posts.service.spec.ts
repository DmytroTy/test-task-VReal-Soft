import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerWinston } from '../logger/logger-winston.service';
import { Post } from './post.entity';
import { PostsService } from './posts.service';
import { MockPostsRepository } from './testing/mock.posts.repository';

describe('PostsService', () => {
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        LoggerWinston,
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useClass: MockPostsRepository,
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
  });

  it('postsService should be defined', () => {
    expect(postsService).toBeDefined();
  });
});
