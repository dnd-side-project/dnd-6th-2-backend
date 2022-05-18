import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    type: String,
    description: '로그인에 필요한 사용자의 이메일',
    example: 'dnd@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    type: String,
    description: '로그인에 필요한 사용자의 비밀번호',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
