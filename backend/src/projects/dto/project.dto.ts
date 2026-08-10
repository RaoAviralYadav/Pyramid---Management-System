import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateProjectDto {
  @IsString() @MaxLength(120) name: string;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() leadId?: string;
}

export class UpdateProjectDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() leadId?: string;
}
