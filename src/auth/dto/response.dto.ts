import { ApiProperty } from '@nestjs/swagger';

export class LoginResDto {
  @ApiProperty({
    type: String,
    description: '발급된 액세스 토큰. (클라이언트단에 저장 필요)',
  })
  access: string;

  @ApiProperty({
    type: String,
    description: '발급된 액세스 토큰. (클라이언트단에 저장 필요)',
  })
  refresh: string;
}

export class SignUpResDto {
  @ApiProperty({
    type: String,
    description: '회원가입한 유저의 이메일',
  })
  email: string;
}

export class CodeResDto {
  @ApiProperty({
    type: Number,
    description: '이메일로 전송된 인증 번호',
  })
  authCode: number;

  @ApiProperty({
    type: String,
  })
  message: string;
}

export class CheckResDto {
  @ApiProperty({
    type: Boolean,
    description: '인증 성공 여부',
  })
  result: boolean;

  @ApiProperty({
    type: String,
  })
  message: string;
}

export class RefreshResDto {
  @ApiProperty({
    type: String,
    description: '새로 발급된 액세스 토큰',
  })
  access: string;
}
