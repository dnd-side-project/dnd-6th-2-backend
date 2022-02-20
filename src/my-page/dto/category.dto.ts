import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryDto {
  @ApiProperty({
    type: String,
    description: '카테고리의 이름',
  })
  @IsNotEmpty()
  @IsString()
  readonly title: string;
}
