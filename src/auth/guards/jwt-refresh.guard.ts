import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.headers.auth.refresh;

    if (err) {
      this.authService.logOut(user._id, refreshToken);
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
