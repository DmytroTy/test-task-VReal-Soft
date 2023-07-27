import { Field, ObjectType, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType({ description: 'ID Type' })
export class ID {
  @Field((type) => Int)
  @ApiProperty()
  id: number;
}
