import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRelayDto {
  @ApiProperty({
    type: String,
    description: '릴레이 방의 제목(이름)',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    type: Array,
    description: '릴레이 방에 추가한 태그 목록',
  })
  @IsArray()
  tags: string[];

  @ApiProperty({
    type: String,
    description: '릴레이 방의 공지사항',
  })
  @IsString()
  notice: string;

  @ApiProperty({
    type: Number,
    description: '릴레이 방의 참여 가능 총 인원수',
  })
  @IsNotEmpty()
  @IsNumber()
  headCount: number;
}
