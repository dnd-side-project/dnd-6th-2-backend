import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    type: String,
    description: '사용자의 이메일',
    example: 'dnd@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @ApiProperty({
    type: String,
    description: '사용자의 비밀번호',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @ApiProperty({
    type: String,
    description: '사용자의 닉네임',
  })
  @IsNotEmpty()
  @IsString()
  readonly nickname: string;

  @ApiProperty({
    type: Array,
    description: '사용자의 관심 장르',
  })
  readonly genre: string[];

  @ApiProperty({
    type: String,
    description: '사용자의 자기소개 한 줄',
  })
  readonly bio: string;
}
