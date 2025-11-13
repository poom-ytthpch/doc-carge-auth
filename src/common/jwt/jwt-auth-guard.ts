import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { RoleType } from 'generated/prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext) {
    const req = this.getRequest(context);
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = authorizationHeader.replace('Bearer ', '');
    const secret = this.config.get<string>('JWT_SECRET');

    console.log({ token, secret });

    try {
      const decoded = await this.jwt.verifyAsync(token, { secret });

      console.log({ decoded })

      const user = await this.authService.findByMobile(decoded.payload?.userInfo?.mobile);
      if (!user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      if (user?.status !== 'ACTIVE') {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const requiredRoles =
        this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
          context.getHandler(),
          context.getClass(),
        ]) || [];

      const roles = user?.roles?.map((role) => role.type);

      if (requiredRoles.length > 0) {
        const hasRole = requiredRoles.some((role) => roles.includes(role));
        if (!hasRole) {
          throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }
      }

      req.user = decoded.payload;
      return true;
    } catch (error) {
      console.error('JWT verify failed:', error);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
