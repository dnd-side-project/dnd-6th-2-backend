import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthCredentialDto } from './dto/auth.dto';
import { User } from './schemas/user.schema';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: '회원가입을 하기 위한 엔드포인트입니다',
    description:
      '로그인에 필요한 이메일, 비밀번호를 입력받아 유저 정보로 등록합니다',
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
  })
  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialDto: AuthCredentialDto,
  ): Promise<User> {
    return this.authService.signUp(authCredentialDto);
  }
}
