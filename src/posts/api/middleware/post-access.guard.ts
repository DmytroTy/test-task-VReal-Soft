import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { LoggerWinston } from '../../../logger/logger-winston.service';
import { Post } from '../../post.entity';

@Injectable()
export class PostAccessGuard implements CanActivate {
  constructor(
    private readonly logger: LoggerWinston,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
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

    const post = await this.postsRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
    });

    if (!post) {
      this.logger.warn(
        `User error: user with id = ${userId} haven't access to post with id = ${id}`,
        'PostAccessGuard',
      );
    }

    return !!post;
  }
}
