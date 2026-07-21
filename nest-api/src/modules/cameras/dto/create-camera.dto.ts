import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateCameraDto {
  @IsString()
  @IsNotEmpty()
  numeroSerie: string;

  @IsString()
  @IsNotEmpty()
  adresseIP: string;

  @IsString()
  @IsNotEmpty()
  zone: string;

  @IsString()
  @IsNotEmpty()
  emplacement: string;

  @IsDateString()
  dateInstallation: string;
}
