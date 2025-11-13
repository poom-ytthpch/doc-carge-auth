import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('otp')
export class OtpProcessor {
  @Process('sendOtp')
  async handleSendOtp(
    job: Job<{ mobile: string; refId: string; otp: string }>,
  ) {
    const { mobile, refId, otp } = job.data;

    console.log(`📩 Sending OTP ${otp} to ${mobile} with refId ${refId}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`✅ OTP sent to ${mobile}`);
  }
}
