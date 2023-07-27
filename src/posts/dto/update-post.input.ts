import { InputType, PartialType } from '@nestjs/graphql';
import { CreatePostDto } from './create-post.dto';

@InputType()
export class UpdatePostInput extends PartialType(CreatePostDto) {}
