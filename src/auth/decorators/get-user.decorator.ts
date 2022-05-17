import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): ParameterDecorator => {
    const req = ctx.switchToHttp().getRequest();

    return req.user;
  },
);
