import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { MessageResDto } from 'src/relay/dto/response.dto';
import { AuthService } from './auth.service';
import { GetUser } from './decorators/get-user.decorator';
import { AuthCredentialDto } from './dto/auth.dto';
import { AuthCodeDto, MailAuthDto } from './dto/change-password.dto';
import { CheckResDto, CodeResDto, LoginResDto } from './dto/response.dto';
import { SignUpDto } from './dto/signup.dto';
import { User } from './schemas/user.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: '회원가입을 하기 위한 엔드포인트입니다',
    description:
      '로그인에 필요한 이메일, 비밀번호를 입력받아 유저 정보로 등록합니다',
  })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 201,
    type: User,
    description: '회원가입 성공',
  })
  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    const user = await this.authService.signUp(signUpDto);
    return res.status(HttpStatus.CREATED).json(user);
  }

  @ApiOperation({
    summary: '로그인을 하기 위한 엔드포인트입니다',
    description:
      '로그인에 필요한 이메일, 비밀번호를 받아 로그인 한 뒤, accessToken을 발행합니다',
  })
  @ApiBody({ type: AuthCredentialDto })
  @ApiResponse({
    status: 200,
    type: LoginResDto,
    description: '로그인 성공',
  })
  @Post('/login')
  async logIn(
    @Body() authCredentialDto: AuthCredentialDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.logIn(authCredentialDto);

    // FIX
    // res.cookie('auth', { accessToken, refreshToken });
    return accessToken;
    // return res
    //   .status(HttpStatus.OK)
    //   .json({ accessToken, message: '로그인 성공' });
  }

  @ApiOperation({
    summary: '비밀번호 재설정 시 이메일 인증을 하기 위한 엔드포인트입니다',
    description:
      '이메일을 받아 해당 이메일로 인증번호를 보냅니다. 아직 디자인팀에게 확답을 듣지 못해서 로그인 여부에 상관없이 가능하도록 구현했습니다',
  })
  @ApiBody({ type: MailAuthDto })
  @ApiResponse({
    status: 200,
    type: CodeResDto,
    description: '인증 메일 전송 성공',
  })
  @Post('/email')
  async sendEmail(@Body() mailAuthDto: MailAuthDto, @Res() res: Response) {
    const { email } = mailAuthDto;
    const authCode = await this.authService.sendEmail(email);

    return res
      .status(HttpStatus.OK)
      .json({ authCode, message: '인증 메일 전송 성공 ' });
  }

  @ApiOperation({
    summary: '이메일 인증 확인을 위한 엔드포인트입니다',
    description:
      '인증 메일로부터 받은 인증코드를 입력받아 인증 확인을 합니다. 해당 엔드포인트를 거쳐 인증이 된 것이 확인되면, 비밀번호 변경 엔드포인트로 이동합니다',
  })
  @ApiBody({ type: AuthCodeDto })
  @ApiResponse({
    status: 200,
    type: CheckResDto,
    description: '인증 성공 (verifyCode: true)',
  })
  @ApiResponse({
    status: 401,
    type: CheckResDto,
    description: '인증 실패 (verifyCode: false)',
  })
  @Post('/email/check')
  async verifyAuthCode(@Body() authCodeDto: AuthCodeDto, @Res() res: Response) {
    const result = await this.authService.verifyAuthCode(authCodeDto);
    if (result.verifyCode) {
      return res.status(HttpStatus.OK).json(result);
    } else {
      throw new UnauthorizedException(result);
    }
  }

  @ApiOperation({
    summary: '이메일 인증 후 비밀번호 재설정을 하기 위한 엔드포인트입니다',
    description:
      '인증 메일로 받은 인증코드로 인증을 한 뒤, 비밀번호를 받아 재설정합니다. 해당 엔드포인트도 현재는 로그인 여부에 상관없이 가능하도록 구현했습니다.',
  })
  @ApiBody({ type: AuthCredentialDto })
  @ApiResponse({
    status: 200,
    type: User,
    description: '비밀번호 재설정 성공',
  })
  @Patch('/password')
  async changePassword(
    @Body() authCredentialDto: AuthCredentialDto,
    @Res() res: Response,
  ) {
    const user = await this.authService.changePassword(authCredentialDto);
    return res.status(HttpStatus.OK).json(user);
  }

  @ApiOperation({
    summary: '로그아웃을 하기 위한 엔드포인트입니다',
    description: '로그인 상태의 사용자를 로그아웃 상태로 처리합니다',
  })
  @ApiResponse({
    status: 200,
    type: MessageResDto,
    description: '로그아웃 성공(message 반환)',
  })
  @ApiBearerAuth('accessToken')
  @Patch('/logout')
  @UseGuards(AuthGuard())
  async logOut(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logOut(user.email);
    // FIX
    // res.clearCookie('auth');
    const message = '로그아웃 성공';
    return { message };
    // return res.status(HttpStatus.OK).json({ message: '로그아웃 성공' });
  }

  // test
  @Get('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    return user;
  }
}
