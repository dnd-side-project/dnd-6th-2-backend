import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/auth.strategy';
import { AuthRepository } from './repository/auth.repository';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: 60 * 60, // 1h
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy],
  exports: [JwtStrategy, PassportModule], // 인증
})
export class AuthModule {}
