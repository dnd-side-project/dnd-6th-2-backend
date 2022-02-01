import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKeyWordDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
