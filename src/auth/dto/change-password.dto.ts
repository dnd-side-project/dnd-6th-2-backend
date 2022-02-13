import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MailAuthDto {
  @ApiProperty({
    type: String,
    description: '인증 메일을 보낼 사용자의 이메일(가입 시 입력한 이메일)',
    example: 'user@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class AuthCodeDto {
  @ApiProperty({
    type: String,
    description: '인증 메일을 받은 사용자의 이메일',
    example: 'user@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    type: Number,
    description: '인증 메일에서 받은 인증 코드',
  })
  @IsNotEmpty()
  @IsNumber()
  authCode: number;
}

export class PasswordDto {
  @ApiProperty({
    type: String,
    description: '비밀번호를 변경할 사용자의 이메일',
    example: 'user@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    type: String,
    description: '비밀번호 재설정 시 사용자가 입력한 새 비밀번호',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
