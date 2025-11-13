import { Metadata } from '@grpc/grpc-js';
import { Controller, HttpStatus } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { auth } from 'src/types/grpc/proto/server/auth';

@Controller()
export class AuthGrpc {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'GetUserByMobile')
  async getUserByMobile(
    data: auth.GetUserByMobileWalletRequest,
    metadata: Metadata,
  ): Promise<auth.GetUserByMobileResponse> {
    const { mobile } = data;
    if (!mobile) {
      return {
        status: 400,
        message: 'Mobile is required',
        data: undefined,
      };
    }
    const user = await this.authService.findByMobile(mobile);

    if (!user) {
      return {
        status: 404,
        message: 'User not found',
        data: undefined,
      };
    }

    return {
      status: 200,
      message: 'User found',
      data: user,
    };
  }

  @GrpcMethod('AuthService', 'VerifyToken')
  async verifyToken(
    data: auth.VerifyTokenRequest,
    metadata: Metadata,
  ): Promise<auth.VerifyTokenResponses> {
    const { token } = data;
    if (!token) {
      return {
        status: 400,
        message: 'Token is required',
        data: undefined,
      };
    }
    const verify = await this.authService.verifyToken(token);

    if (!verify.status) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: verify.message,
        data: undefined,
      };
    }

    return {
      status: HttpStatus.OK,
      message: verify.message,
      data: verify.data as auth.User,
    };
  }
}
