import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {

  @ApiProperty({
    type: String,
    description: '글 제목',
    default: '오늘 일기',
  })
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({
    type: String,
    description: '글 내용',
    default: '오늘은 카페에 갔다.',
  })
  @IsNotEmpty()
  @IsString()
  readonly content: string;

  @ApiProperty({
    type: Array,
    description: '글 태그',
    default: ['일상', '공부'],
  })
  @IsNotEmpty()
  @IsArray()
  readonly tags: string[];

  @ApiProperty({ type: Boolean, description: '글 공개 여부', default: 'false' })
  @IsNotEmpty()
  @IsBoolean()
  readonly public: boolean;

  state: boolean;
  keyWord: string;
}
