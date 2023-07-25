import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Role } from '../../enums/role.enum';

@InputType()
export class ChangeUserRoleDto {
  @Field()
  @ApiProperty()
  @IsNotEmpty()
  readonly role: Role;
}
