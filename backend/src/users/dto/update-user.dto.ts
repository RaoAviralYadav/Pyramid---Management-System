import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { AccentColor, Theme } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(80) fullName?: string;
  @IsOptional() @IsString() @MaxLength(80) title?: string;
  @IsOptional() @IsString() @MaxLength(30) username?: string;
  @IsOptional() @IsUrl() avatarUrl?: string;
}

export class UpdatePreferencesDto {
  @IsOptional() @IsEnum(Theme) theme?: Theme;
  @IsOptional() @IsEnum(AccentColor) accentColor?: AccentColor;
}
