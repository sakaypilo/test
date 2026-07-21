import { IsString, IsOptional } from 'class-validator';

export class GenerateIncidentReportDto {
  @IsOptional()
  @IsString()
  observations?: string;
}
