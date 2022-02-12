import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtRefreshGuard
  extends AuthGuard('jwt-refresh')
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req?.cookies?.auth?.refreshToken) {
      return true;
    }
    // refreshToken 만료된 경우 strategy에서 401 error
  }
}
