import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class UpdateCameraDto {
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

  @IsEnum(['actif', 'panne', 'hors ligne'])
  statut: string;

  @IsOptional()
  motif?: string;
}
