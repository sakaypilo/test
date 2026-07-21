import { IsArray, IsOptional, IsString } from 'class-validator';

export class BulkUpdateDto {
  @IsArray()
  ids: number[];

  @IsOptional()
  @IsString()
  typeIncident?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
