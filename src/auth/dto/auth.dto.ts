import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthCredentialDto {
  @ApiProperty({
    type: String,
    description: '로그인에 필요한 사용자의 이메일',
    example: 'dnd@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @ApiProperty({
    type: String,
    description: '로그인에 필요한 사용자의 비밀번호',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
