import { IsArray, IsOptional, IsString } from 'class-validator';

export class BulkDeleteDto {
  @IsArray()
  ids: number[];

  @IsOptional()
  @IsString()
  reason?: string;
}
