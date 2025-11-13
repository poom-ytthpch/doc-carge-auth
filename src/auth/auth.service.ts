import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { GqlError } from 'src/common/error';
import { Prisma, RoleType, User } from 'generated/prisma/client';
import { OtpService } from 'src/otp/otp.service';
import { ClientGrpc } from '@nestjs/microservices';
import { wallet } from 'src/types/grpc/proto/client/wallet';
import { firstValueFrom } from 'rxjs';
import { get } from 'lodash';
import {
  CommonResponse,
  LoginRequest,
  LoginResponse,
  MobileRegisterRequest,
} from 'src/types/gql';
import { CreateUserInput } from './dto/create-auth.input';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { VerifyTokenResponse } from './dto/verify-token';
import { status } from '@grpc/grpc-js';

@Injectable()
export class AuthService implements OnModuleInit {
  private walletService: wallet.WalletService;
  constructor(
    private repos: PrismaService,
    private otpService: OtpService,
    @Inject('WALLET_SERVICE') private client: ClientGrpc,
    private jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.walletService =
      this.client.getService<wallet.WalletService>('WalletService');
  }

  async createUserByMobile(input: CreateUserInput): Promise<User | undefined> {
    const { mobile, pin } = input;
    try {
      const hash = await bcrypt.hash(pin, 10);
      const now = new Date();
      const newUser = await this.repos.user.create({
        data: {
          mobile,
          pin: hash,
          createdAt: now,
          roles: {
            createMany: {
              data: [
                {
                  type: RoleType.USER,
                  createdAt: now,
                  updatedAt: now,
                },
              ],
            },
          },
        },
      });
      return newUser;
    } catch (error) {
      throw GqlError.Internal(error.message);
    }
  }

  async mobileRegister(input: MobileRegisterRequest): Promise<CommonResponse> {
    const { mobile, pin } = input;
    try {
      const isUserExist = await this.findByMobile(mobile);
      if (isUserExist) {
        return { status: false, message: 'User already exist' };
      }

      if (pin.length !== 4) {
        throw GqlError.BadRequest('Pin must be 4 digits');
      }

      const wallet = await firstValueFrom(
        this.walletService.createWallet({
          mobile,
        }),
      );

      if (wallet.status !== 200) {
        throw GqlError.Internal(get(wallet, 'message') || 'Wallet error');
      }

      const user = await this.createUserByMobile(input);
      if (user) {
        await this.otpService.sendOtp(mobile, 'REGISTER');
        return { status: true, message: 'User created successfully' };
      }

      return { status: false, message: 'User not created' };
    } catch (error) {
      throw GqlError.Internal(error.message);
    }
  }

  async findByMobile(
    mobile: string,
  ): Promise<Prisma.UserGetPayload<{ include: { roles: true } }>> {
    try {
      const user = await this.repos.user.findUnique({
        where: { mobile },
        include: { roles: true },
      });
      return user as Prisma.UserGetPayload<{ include: { roles: true } }>;
    } catch (error) {
      throw GqlError.Internal(error.message);
    }
  }

  async login(input: LoginRequest): Promise<LoginResponse> {
    const { mobile, pin } = input;
    try {
      const user = await this.findByMobile(mobile);
      if (!user) {
        return { status: false, message: 'User not found' };
      }
      const isMatch = await bcrypt.compare(pin, user.pin);
      if (user && isMatch) {
        const payload = {
          sub: user.id,
          userInfo: {
            mobile: user.mobile,
            status: user.status,
            roles: user.roles.map((role) => role.type),
          },
        };

        const token = await this.jwtService.signAsync({
          sub: user.id,
          payload,
        });

        return { status: true, message: 'login success', token };
      }
      return { status: false, message: 'Pin is incorrect' };
    } catch (error) {
      throw GqlError.Internal(error.message);
    }
  }

  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    try {
      const isValid = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      if (!isValid) {
        return {
          status: false,
          message: 'Token is not valid',
          data: undefined,
        };
      }
      const decoded = await this.jwtService.decode(token);

      const user = await this.findByMobile(decoded.payload.mobile);

      return { status: true, message: 'success', data: user };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        data: undefined,
      };
    }
  }
}
