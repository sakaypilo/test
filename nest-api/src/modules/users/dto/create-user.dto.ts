import { IsEmail, IsString, IsOptional, Matches, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^\d{7}$/, { message: 'Matricule must be 7 digits' })
  matricule: string;

  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsString()
  motDePasse: string;

  @IsEnum(['admin', 'agent', 'technicien', 'responsable'])
  role: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telephone?: string;
}
