import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString() @MinLength(1) content: string;
}

export class ReactDto {
  @IsString() @MaxLength(8) emoji: string;
}