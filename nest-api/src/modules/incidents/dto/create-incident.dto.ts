import { IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateIncidentDto {
  @IsDateString()
  dateHeure: string;

  @IsString()
  @IsNotEmpty()
  typeIncident: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  zone: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  idCamera: number;
}
