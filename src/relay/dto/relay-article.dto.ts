import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RelayArticleDto {
  @ApiProperty({
    type: String,
    description: '작성한 글의 내용',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    type: String,
    description: '선택한 카테고리의 id',
  })
  @IsString()
  categoryId: string;
}
