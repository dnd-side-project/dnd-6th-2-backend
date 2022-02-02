import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKeyWordDto {
  @ApiProperty({ type: String, default: '글감' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
