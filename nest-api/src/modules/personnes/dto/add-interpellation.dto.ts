import { IsString, IsNotEmpty } from 'class-validator';

export class AddInterpellationDto {
  @IsString()
  @IsNotEmpty()
  faitAssocie: string;
}
