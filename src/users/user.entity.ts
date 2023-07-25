import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { Message, PaginatedMessage } from '../messages/message.entity';
import { Paginated } from '../types/paginated.type';

@ObjectType({ description: 'User model' })
@Entity()
export class User {
  @Field((type) => Int)
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @ApiPropertyOptional()
  @Column({
    unique: true,
    nullable: true,
  })
  email?: string;

  @Field()
  @ApiProperty()
  @Column()
  username: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Field()
  @ApiProperty()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({
    unique: true,
    nullable: true,
  })
  @Exclude()
  facebookId?: string;

  @DeleteDateColumn()
  @Exclude()
  deletedAt?: Date;

  @Field((type) => PaginatedMessage, { nullable: true })
  @OneToMany((type) => Message, (message) => message.user)
  messages?: Message[];
}

@ObjectType()
export class PaginatedUser extends Paginated(User) {}
