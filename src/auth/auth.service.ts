import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthRepository } from './repository/auth.repository';
import { User } from './schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthCodeDto } from './dto/change-password.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private mailerService: MailerService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    return await this.authRepository.signUp(signUpDto);
  }

  async validateUser(email: string, password: string) {
    return await this.authRepository.validateUser(email, password);
  }

  async validateAccess(email: string) {
    return await this.authRepository.validateAccess(email);
  }

  async validateRefresh(email: string) {
    return await this.authRepository.validateRefresh(email);
  }

  async getAccessToken(email: string) {
    return await this.authRepository.getAccessToken(email);
  }

  async logIn(user: User) {
    return await this.authRepository.logIn(user);
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

      return authCode;
    } catch (e) {
      throw new InternalServerErrorException('이메일 발신에 실패했습니다.');
    }
  }

  async verifyAuthCode(authCodeDto: AuthCodeDto) {
    return await this.authRepository.verifyAuthCode(authCodeDto);
  }

  async removeAuthCode(email: string) {
    return await this.authRepository.removeAuthCode(email);
  }

  async changePassword(loginDto: LoginDto) {
    return await this.authRepository.changePassword(loginDto);
  }

  async logOut(email: string) {
    return await this.authRepository.logOut(email);
  }
}
