import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { AuthCredentialDto } from './dto/auth.dto';
import {
  AuthCodeDto,
  MailAuthDto,
  PasswordDto,
} from './dto/change-password.dto';
import { SignUpDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
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
    description:
      '이메일을 받아 해당 이메일로 인증번호를 보냅니다. 아직 디자인팀에게 확답을 듣지 못해서 로그인이 필요하지 않은 로직으로 구현했습니다',
  })
  @ApiResponse({
    status: 200,
    description: '인증 메일 전송 성공',
  })
  @Post('/email')
  sendEmail(@Body(ValidationPipe) mailAuthDto: MailAuthDto): Promise<number> {
    const { email } = mailAuthDto;
    return this.authService.sendEmail(email);
  }

  @ApiOperation({
    summary: '이메일 인증 확인을 위한 엔드포인트입니다',
    description:
      '인증 메일로부터 받은 인증코드를 입력받아 인증 확인을 합니다. 해당 엔드포인트를 거쳐 인증이 된 것이 확인되면, 비밀번호 변경 엔드포인트로 이동합니다',
  })
  @ApiResponse({
    status: 200,
    description: '인증 성공',
  })
  @Post('/email/check')
  verifyAuthCode(
    @Body(ValidationPipe) authCodeDto: AuthCodeDto,
  ): Promise<boolean> {
    return this.authService.verifyAuthCode(authCodeDto);
  }

  @ApiOperation({
    summary: '이메일 인증 후 비밀번호 재설정을 하기 위한 엔드포인트입니다',
    description:
      '인증 메일로 받은 인증코드로 인증을 한 뒤, 비밀번호를 받아 재설정합니다. 해당 엔드포인트도 현재는 로그인이 필요하지 않은 로직으로 구현했습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 성공',
  })
  @Patch('/password')
  changePassword(
    @Body(ValidationPipe) passwordDto: PasswordDto,
  ): Promise<User> {
    return this.authService.changePassword(passwordDto);
  }

  @ApiOperation({
    summary: '로그아웃을 하기 위한 엔드포인트입니다',
    description: '로그인 상태의 사용자를 로그아웃 상태로 처리합니다',
  })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  @UseGuards(JwtAuthGuard, JwtRefreshGuard)
  @ApiBearerAuth('accessToken')
  @Delete('/logout')
  logOut(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
    const { email } = user;

    res.clearCookie('auth');
    return this.authService.logOut(email);
  }
}
