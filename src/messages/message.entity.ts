import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Paginated } from '../types/paginated.type';
import { User } from '../users/user.entity';

@ObjectType({ description: 'Message model' })
@Entity()
export class Message {
  @Field((type) => Int)
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @ApiProperty()
  @Column('text')
  post: string;

  @ManyToOne((type) => User, (user) => user.messages)
  user: User;
}

@ObjectType()
export class PaginatedMessage extends Paginated(Message) {}
