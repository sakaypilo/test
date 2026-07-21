import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateIncidentDto {
  @IsOptional()
  @IsString()
  typeIncident?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsDateString()
  dateHeure?: string;
}
