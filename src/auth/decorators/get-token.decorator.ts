import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetToken = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  return req?.cookies?.auth;
});
