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
import { Role } from '../common/enums/role.enum';
import { Post, PaginatedPost } from '../posts/post.entity';
import { Paginated } from '../common/types/paginated.type';

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

  @Field((type) => PaginatedPost, { nullable: true })
  @OneToMany((type) => Post, (post) => post.user)
  posts?: Post[];
}

@ObjectType()
export class PaginatedUser extends Paginated(User) {}
