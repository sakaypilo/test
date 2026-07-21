import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ValidateIncidentDto {
  @IsEnum(['valide', 'rejete'])
  statut: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
}
