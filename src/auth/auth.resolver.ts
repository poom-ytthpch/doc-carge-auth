import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginRequest, MobileRegisterRequest } from 'src/types/gql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth-guard';
import { RoleType } from 'generated/prisma/enums';
import { Roles } from 'src/common/jwt/roles.decorator';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.USER, RoleType.ADMIN, RoleType.ROOT)
  @Query('getUserByMobile')
  getUserByMobile(@Args('mobile') mobile: string) {
    return this.authService.findByMobile(mobile);
  }

  @Mutation('mobileRegister')
  mobileRegister(@Args('input') input: MobileRegisterRequest) {
    return this.authService.mobileRegister(input);
  }

  @Mutation('login')
  verifyPin(@Args('input') input: LoginRequest) {
    return this.authService.login(input);
  }
}
