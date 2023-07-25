import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerWinston } from '../logger/logger-winston.service';
import { Message } from './message.entity';
import { MessagesService } from './messages.service';
import { MockMessagesRepository } from './testing/mock.messages.repository';

describe('MessagesService', () => {
  let messagesService: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        LoggerWinston,
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useClass: MockMessagesRepository,
        },
      ],
    }).compile();

    messagesService = module.get<MessagesService>(MessagesService);
  });

  it('messagesService should be defined', () => {
    expect(messagesService).toBeDefined();
  });
});
