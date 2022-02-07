import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthCredentialDto } from './dto/auth.dto';
import { AuthRepository } from './repository/auth.repository';
import { User } from './schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private mailerService: MailerService,
  ) {}

  async signUp(authCredentialDto: AuthCredentialDto): Promise<User> {
    return this.authRepository.signUp(authCredentialDto);
  }

  async logIn(
    authCredentialDto: AuthCredentialDto,
  ): Promise<{ accessToken: string }> {
    return this.authRepository.logIn(authCredentialDto);
  }

  async sendEmail(email: string): Promise<string> {
    try {
      const authCode: string = Math.random().toString().substring(2, 7); // 6글자

      const mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: '이메일 인증',
        text: '이메일 인증 코드 ' + authCode,
      };

      await this.mailerService.sendMail(mailOptions);

      return authCode;
    } catch (e) {
      throw new InternalServerErrorException('이메일 발신 실패');
    }
  }
}
