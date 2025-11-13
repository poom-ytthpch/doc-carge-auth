import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OtpService } from './otp.service';
import { SendOtpInput, SendOtpResponse, VerifyOtpInput } from 'src/types/gql';

@Resolver('Otp')
export class OtpResolver {
  constructor(private readonly otpService: OtpService) {}

  @Mutation('sendOtp')
  async sendOtp(@Args('input') input: SendOtpInput): Promise<SendOtpResponse> {
    return await this.otpService.sendOtp(input.mobile, input.purpose);
  }

  @Mutation('verifyOtp')
  async verifyOtp(@Args('input') input: VerifyOtpInput): Promise<boolean> {
    return await this.otpService.verifyOtp(input);
  }
}
