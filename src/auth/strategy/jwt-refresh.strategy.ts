import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRepository } from '../repository/auth.repository';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authRepository: AuthRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.auth?.refreshToken;
        },
      ]),
      secretOrKey: process.env.SECRET_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(req, payload, res) {
    const { email } = payload;
    const refreshToken = req.cookies?.auth?.refreshToken;

    const user = await this.authRepository.validateRefresh(email, refreshToken);
    const accessToken = await this.authRepository.getAccessToken(email);

    // cookie 저장
    res.cookie('auth', { accessToken, refreshToken });
    return user;
  }
}
