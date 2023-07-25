import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../enums/role.enum';
import { LoggerWinston } from '../../../logger/logger-winston.service';
import { Message } from '../../message.entity';

@Injectable()
export class MessageAccessGuard implements CanActivate {
  constructor(
    private readonly logger: LoggerWinston,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let id, userId: number;
    let role: Role;
    const request = context.switchToHttp().getRequest();
    if (request) {
      ({
        params: { id },
        user: { userId, role },
      } = request);
    } else {
      const ctx = GqlExecutionContext.create(context);
      ({ id } = ctx.getArgs());
      ({ userId, role } = ctx.getContext().req.user);
    }

    if (role === Role.ADMIN) {
      return true;
    }

    const message = await this.messagesRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
    });

    if (!message) {
      this.logger.warn(
        `User error: user with id = ${userId} haven't access to message with id = ${id}`,
        'MessageAccessGuard',
      );
    }

    return !!message;
  }
}
