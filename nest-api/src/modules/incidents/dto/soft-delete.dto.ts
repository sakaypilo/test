import { IsOptional, IsString } from 'class-validator';

export class SoftDeleteDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
