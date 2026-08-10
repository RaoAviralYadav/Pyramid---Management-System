import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateSubtaskDto {
  @IsString() @MaxLength(160) title: string;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() assigneeId?: string;
}

export class UpdateSubtaskDto {
  @IsOptional() @IsString() @MaxLength(160) title?: string;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() assigneeId?: string;
}
