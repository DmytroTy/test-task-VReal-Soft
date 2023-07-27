import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Paginated } from '../common/types/paginated.type';
import { User } from '../users/user.entity';

@ObjectType({ description: 'Post model' })
@Entity()
export class Post {
  @Field((type) => Int)
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @ApiProperty()
  @Column('text')
  text: string;

  @ManyToOne((type) => User, (user) => user.posts)
  user: User;
}

@ObjectType()
export class PaginatedPost extends Paginated(Post) {}
