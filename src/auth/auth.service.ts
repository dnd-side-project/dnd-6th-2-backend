import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthCredentialDto } from './dto/auth.dto';
import { AuthRepository } from './repository/auth.repository';
import { User } from './schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { MailAuthDto, PasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private mailerService: MailerService,
  ) {}

  async signUp(authCredentialDto: AuthCredentialDto): Promise<User> {
    return this.authRepository.signUp(authCredentialDto);
  }

  async logIn(authCredentialDto: AuthCredentialDto) {
    return this.authRepository.logIn(authCredentialDto);
  }

  async sendEmail(mailAuthDto: MailAuthDto): Promise<string> {
    const { email } = mailAuthDto;

    try {
      const authCode: string = Math.random().toString().substring(2, 8); // 6글자

      const mailOptions = {
        from: `${process.env.EMAIL_ID}`,
        to: `${email}`,
        subject: '이메일 인증 요청 메일입니다.',
        text: `이메일 인증 : ${authCode}`,
      };
      // TODO: 테스트
      // FIX: 메일 템플릿

      await this.mailerService.sendMail(mailOptions);

      return authCode;
    } catch (e) {
      throw new InternalServerErrorException('이메일 발신 실패');
    }
  }

  async changePassword(email: string, passwordDto: PasswordDto): Promise<User> {
    return this.authRepository.changePassword(email, passwordDto);
  }
}
