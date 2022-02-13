import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthCredentialDto } from './dto/auth.dto';
import { AuthRepository } from './repository/auth.repository';
import { User } from './schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthCodeDto, PasswordDto } from './dto/change-password.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private mailerService: MailerService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    return this.authRepository.signUp(signUpDto);
  }

  async logIn(authCredentialDto: AuthCredentialDto) {
    return this.authRepository.logIn(authCredentialDto);
  }

  async sendEmail(email: string): Promise<number> {
    try {
      const authCode: number = parseInt(
        Math.random().toString().substring(2, 8),
      ); // 6글자

      const mailOptions = {
        from: `${process.env.EMAIL_ID}`,
        to: `${email}`,
        subject: '이메일 인증 요청 메일입니다.',
        text: `인증 번호 : ${authCode}`,
      };

      await this.mailerService.sendMail(mailOptions);
      await this.authRepository.storeAuthCode(email, authCode);

      return authCode; // test
    } catch (e) {
      throw new InternalServerErrorException('이메일 발신 실패');
    }
  }

  async verifyAuthCode(authCodeDto: AuthCodeDto) {
    return this.authRepository.verifyAuthCode(authCodeDto);
  }

  async changePassword(passwordDto: PasswordDto): Promise<User> {
    return this.authRepository.changePassword(passwordDto);
  }

  async logOut(email: string) {
    return this.authRepository.removeRefreshToken(email);
  }
}
