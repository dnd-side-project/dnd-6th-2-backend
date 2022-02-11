import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as dotenv from 'dotenv';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtUserStrategy } from './passport/auth.strategy';
import { AuthRepository } from './repository/auth.repository';
import { User, UserSchema } from './schemas/user.schema';

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
      signOptions: {
        expiresIn: 3 * 60 * 60, // 3h
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtUserStrategy],
  exports: [JwtUserStrategy, PassportModule], // 인증
})
export class AuthModule {}
