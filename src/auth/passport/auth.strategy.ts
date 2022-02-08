import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRepository } from '../repository/auth.repository';
import { User } from '../schemas/user.schema';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy) {
  constructor(private authRepository: AuthRepository) {
    super({
      secretOrKey: process.env.SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload): Promise<User> {
    return this.authRepository.validate(payload);
  }
}
