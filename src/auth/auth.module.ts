import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OtpService } from 'src/otp/otp.service';
import { BullModule } from '@nestjs/bull';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGrpc } from './auth.grpc';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'otp' }),
    ClientsModule.registerAsync({
      clients: [
        {
          inject: [ConfigService],
          name: 'WALLET_SERVICE',
          useFactory: (config: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
              package: 'wallet',
              url: `${config.get('WALLET_SERVICE')}`,
              protoPath: join(__dirname, '../../proto/client/wallet.proto'),
            },
          }),
        },
      ],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthGrpc],
  providers: [AuthResolver, AuthService, PrismaService, OtpService],
})
export class AuthModule {}
