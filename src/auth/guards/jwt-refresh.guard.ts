import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  handleRequest(err, user) {
    if (err) {
      this.authService.logOut(user._id);
      throw new UnauthorizedException(
        '리프레시 토큰 만료. 로그인이 필요합니다.',
      );
    }
    if (!user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    return user;
  }
}
