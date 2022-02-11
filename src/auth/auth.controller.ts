import {
  Body,
  Controller,
  Patch,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { AuthCredentialDto } from './dto/auth.dto';
import { MailAuthDto, PasswordDto } from './dto/change-password.dto';
import { SignUpDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
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
  signUp(@Body(ValidationPipe) signUpDto: SignUpDto): Promise<User> {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({
    summary: '로그인을 하기 위한 엔드포인트입니다',
    description:
      '로그인에 필요한 이메일, 비밀번호를 받아 로그인 한 뒤, accessToken을 발행합니다',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: User,
  })
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async logIn(
    @Body(ValidationPipe) authCredentialDto: AuthCredentialDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.logIn(
      authCredentialDto,
    );

    res.cookie('auth', { accessToken, refreshToken });
    return accessToken; // test
  }

  @ApiOperation({
    summary: '비밀번호 재설정 시 이메일 인증을 하기 위한 엔드포인트입니다',
    description: '이메일을 받아 해당 이메일로 인증번호를 보냅니다',
  })
  @ApiResponse({
    status: 200,
    description: '인증 메일 전송 성공',
  })
  @Post('/email')
  sendEmail(@Body(ValidationPipe) mailAuthDto: MailAuthDto): Promise<string> {
    return this.authService.sendEmail(mailAuthDto);
  }

  @ApiOperation({
    summary: '이메일 인증 후 비밀번호 재설정을 하기 위한 엔드포인트입니다',
    description:
      '인증 메일로 받은 인증코드로 인증을 한 뒤, 비밀번호를 받아 재설정합니다',
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 성공',
  })
  @Patch('/password')
  @UseGuards(AuthGuard())
  changePassword(
    @GetUser() user: User,
    @Body(ValidationPipe) passwordDto: PasswordDto,
  ): Promise<User> {
    const { authCode, password } = passwordDto;

    // TOFIX: 이메일 인증 코드 추가 (authCode - jwt에 저장)

    return this.authService.changePassword(user.email, passwordDto);
  }
}
