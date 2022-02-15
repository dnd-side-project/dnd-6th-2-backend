import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddNoticeDto {
  @ApiProperty({
    type: String,
    description: '릴레이 방에 추가할 공지사항',
  })
  @IsNotEmpty()
  @IsString()
  notice: string;
}
