import { IsOptional, IsString } from 'class-validator';

export class SoftDeleteDto {
  reason?: string;
}
