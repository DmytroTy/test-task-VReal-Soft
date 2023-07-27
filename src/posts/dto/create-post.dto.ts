import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreatePostDto {
  @Field()
  @ApiProperty()
  @IsNotEmpty()
  readonly text: string;
}
