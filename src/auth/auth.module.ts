import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as dotenv from 'dotenv';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repository/auth.repository';
import { User, UserSchema } from './schemas/user.schema';
import { JwtAuthStrategy } from './strategy/jwt-auth.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      // FIX: 메일 template 추가
      // template: {
      //   dir: process.cwd() + '/template/',
      //   adapter: new HandlebarsAdapter(),
      //   options: {
      //     strict: true,
      //   },
      // },
    }),
    JwtModule.register({
      secret: process.env.SECRET_KEY as string,
    }),
    PassportModule.register({ defaultStrategy: ['jwt', 'jwt-refresh'] }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtAuthStrategy, JwtRefreshStrategy],
  exports: [PassportModule, JwtAuthStrategy, JwtRefreshStrategy], // 인증
})
export class AuthModule {}
