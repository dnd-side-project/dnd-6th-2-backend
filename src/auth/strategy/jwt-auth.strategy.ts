import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRepository } from '../repository/auth.repository';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authRepository: AuthRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.auth?.accessToken;
        },
      ]),
      secretOrKey: process.env.SECRET_KEY,
    });
  }

  async validate(payload) {
    const { email } = payload;

    return await this.authRepository.findUserByEmail(email);
  }
}
