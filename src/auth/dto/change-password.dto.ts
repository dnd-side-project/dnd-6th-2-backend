import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class MailAuthDto {
  @ApiProperty({
    type: String,
    description: '인증 메일을 보낼 사용자의 이메일(가입 시 입력한 이메일)',
    example: 'user@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class AuthCodeDto {
  @ApiProperty({
    type: String,
    description: '인증 메일을 받은 사용자의 이메일',
    example: 'user@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: Number,
    description: '인증 메일에서 받은 인증 코드',
  })
  @IsNotEmpty()
  @IsNumber()
  authCode: number;
}
