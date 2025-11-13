import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpResolver } from './otp.resolver';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { BullModule } from '@nestjs/bull';
import { OtpProcessor } from './otp.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'otp',
    }),
  ],
  providers: [OtpResolver, OtpService, PrismaService, OtpProcessor],
})
export class OtpModule {}
