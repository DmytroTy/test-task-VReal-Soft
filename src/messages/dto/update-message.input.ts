import { InputType, PartialType } from '@nestjs/graphql';
import { CreateMessageDto } from './create-message.dto';

@InputType()
export class UpdateMessageInput extends PartialType(CreateMessageDto) {}
