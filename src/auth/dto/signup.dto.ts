import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    type: String,
    description: '사용자의 이메일',
    example: 'dnd@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
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
    type: [String],
    description: '사용자의 관심 장르',
  })
  @IsNotEmpty()
  @IsArray()
  readonly genre: string[];

  @ApiProperty({
    type: String,
    description: '사용자의 자기소개 한 줄',
  })
  @IsNotEmpty()
  @IsString()
  readonly bio: string;
}
