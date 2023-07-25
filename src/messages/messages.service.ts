import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { LoggerWinston } from '../logger/logger-winston.service';
import { ID } from '../types/id.type';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    private readonly logger: LoggerWinston,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    userId: number,
  ): Promise<Message> {
    return this.messagesRepository.save({
      user: { id: userId },
      ...createMessageDto,
    });
  }

  async findByUserId(
    userId: number,
    options: IPaginationOptions,
  ): Promise<Pagination<Message>> {
    const queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .where('message.userId = :userId', { userId })
      .orderBy('message.id', 'DESC');

    return paginate<Message>(queryBuilder, options);
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<Message>> {
    const queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .orderBy('message.id', 'DESC');

    return paginate<Message>(queryBuilder, options);
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messagesRepository.findOne({ where: { id } });

    if (!message) {
      this.logger.warn(
        `User error: Message with id = ${id} not found.`,
        'MessagesService',
      );
      throw new NotFoundException();
    }

    return message;
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messagesRepository.save({ id, ...updateMessageDto });
  }

  async delete(id: number): Promise<ID> {
    await this.messagesRepository.delete(id);
    return { id };
  }
}
