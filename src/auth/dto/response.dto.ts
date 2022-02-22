import { ApiProperty } from '@nestjs/swagger';

export class LoginResDto {
  @ApiProperty({
    type: String,
    description: '액세스 토큰',
  })
  accessToken: string;
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
