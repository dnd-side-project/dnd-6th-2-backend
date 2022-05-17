import {
  Body,
  Controller,
  Get,
  Headers,
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
import { LoginDto } from './dto/login.dto';
import { AuthCodeDto, MailAuthDto } from './dto/change-password.dto';
import {
  CheckResDto,
  CodeResDto,
  LoginResDto,
  RefreshResDto,
  SignUpResDto,
} from './dto/response.dto';
import { SignUpDto } from './dto/signup.dto';
import { User } from './schemas/user.schema';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
    type: SignUpResDto,
    description: '회원가입 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 혹은 유효하지 않은 요청값',
  })
  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    const email = await this.authService.signUp(signUpDto);
    return res.status(HttpStatus.CREATED).json({ email });
  }

  @ApiOperation({
    summary: '로그인을 하기 위한 엔드포인트입니다',
    description:
      '로그인에 필요한 이메일, 비밀번호를 받아 로그인 한 뒤, accessToken을 발행합니다',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    type: LoginResDto,
    description: '로그인 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 혹은 유효하지 않은 요청값',
  })
  @ApiResponse({
    status: 401,
    description: '로그인 실패',
  })
  @ApiResponse({
    status: 404,
    description: '가입되어 있지 않은 이메일',
  })
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async logIn(@GetUser() user: User, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.logIn(user);
    return res
      .status(HttpStatus.OK)
      .json({ access: accessToken, refresh: refreshToken });
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
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    type: MessageResDto,
    description: '비밀번호 재설정 성공',
  })
  @Patch('/password')
  async changePassword(@Body() loginDto: LoginDto, @Res() res: Response) {
    await this.authService.changePassword(loginDto);
    return res.status(HttpStatus.OK).json('비밀번호 재설정 성공');
  }

  @ApiOperation({
    summary: '로그아웃을 하기 위한 엔드포인트입니다',
    description:
      '로그인 상태의 사용자를 로그아웃 상태로 처리합니다 (로그아웃 요청 시, req.headers.auth.refresh에 리프레시 토큰을 담아 전달). - 로그아웃 성공 후, 클라이언트단에 저장된 액세스토큰과 리프레시토큰 모두 삭제.',
  })
  @ApiResponse({
    status: 200,
    type: MessageResDto,
    description: '로그아웃 성공',
  })
  @ApiBearerAuth('refreshToken')
  @Patch('/logout')
  @UseGuards(AuthGuard())
  async logOut(
    @Headers() headers,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const refreshToken = headers.auth.refresh;
    await this.authService.logOut(user._id, refreshToken);

    return res.status(HttpStatus.OK).json('로그아웃 성공');
  }

  @ApiOperation({
    summary: '로그인 연장을 위한 엔드포인트입니다',
    description:
      '리프레시 토큰을 검증한 후, 새로운 액세스 토큰을 발급하여 로그인 상태를 연장하거나 로그아웃합니다',
  })
  @ApiResponse({
    status: 200,
    type: RefreshResDto,
    description: '로그인 연장 성공',
  })
  @ApiResponse({
    status: 401,
    description: '로그인 필요(로그아웃 상태)',
  })
  @ApiBearerAuth('refreshToken')
  @Patch('/refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@GetUser() user: User, @Res() res: Response) {
    const accessToken = await this.authService.getAccessToken(user.email);

    return res.status(HttpStatus.OK).json({ access: accessToken });
  }

  // test
  @Get('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    return user;
  }
}
