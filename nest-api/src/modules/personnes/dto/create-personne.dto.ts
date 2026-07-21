import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreatePersonneDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsString()
  @IsNotEmpty()
  CIN: string;

  @IsEnum(['interne', 'externe'])
  statut: string;

  @IsOptional()
  photo?: string;

  @IsString()
  @IsNotEmpty()
  faitAssocie: string;
}
