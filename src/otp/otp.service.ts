import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { otpGen, customOtpGen } from 'otp-gen-agent';
import moment from 'moment';
import { SendOtpResponse, VerifyOtpInput } from 'src/types/gql';
import { GenerateOtpResponseDto } from './dto/otp.dto';
import { GqlError } from 'src/common/error';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class OtpService {
  constructor(
    private readonly repos: PrismaService,
    @InjectQueue('otp') private otpQueue: Queue,
  ) {}

  private async generateOtp(): Promise<GenerateOtpResponseDto> {
    const otp = await otpGen();
    const expiryTime = moment().add(5, 'minutes').toDate();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const refId = await customOtpGen({
      length: 12,
      chars: `${alphabet}${alphabet.toLowerCase()}1234567890`,
    });

    return { otp, expiresAt: expiryTime, refId };
  }

  async sendOtp(mobile: string, purpose: string): Promise<SendOtpResponse> {
    try {
      const { otp, expiresAt, refId } = await this.generateOtp();

      const otpRecord = await this.repos.otp.create({
        data: {
          mobile,
          code: otp,
          expiredAt: expiresAt,
          refId,
          purpose,
          createdAt: new Date(),
        },
      });

      await this.otpQueue.add('sendOtp', {
        mobile: otpRecord.mobile,
        refId: otpRecord.refId,
        otp: otpRecord.code,
      });

      return { otp, expiredAt: expiresAt, refId };
    } catch (error) {
      throw GqlError.Internal(error.message);
    }
  }

  async verifyOtp(input: VerifyOtpInput): Promise<boolean> {
    const { refId, mobile, otp } = input;
    try {
      const otpRecord = await this.repos.otp.findFirst({
        where: { refId, mobile, code: otp },
      });

      if (otpRecord) {
        return otpRecord.code === otp && otpRecord.expiredAt > new Date();
      }
      return false;
    } catch (error) {
      throw GqlError.Internal(error.message);
    }
  }
}
