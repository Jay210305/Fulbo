import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import type { Twilio } from 'twilio';

const DEV_OTP_CODE = '123456';

@Injectable()
export class TwilioService {
  private readonly client: Twilio | null;
  private readonly verifyServiceSid: string;
  private readonly logger = new Logger(TwilioService.name);

  constructor(config: ConfigService) {
    const accountSid = config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = config.get<string>('TWILIO_AUTH_TOKEN');
    this.verifyServiceSid = config.get<string>('TWILIO_VERIFY_SERVICE_SID', '');

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      this.client = null;
      this.logger.warn(
        'Twilio not configured — OTP running in dev mode (use code 123456)',
      );
    }
  }

  private get enabled(): boolean {
    return this.client !== null && this.verifyServiceSid !== '';
  }

  private normalize(phone: string, countryCode: string): string {
    const digits = `${countryCode}${phone}`.replace(/[^+\d]/g, '');
    return digits.startsWith('+') ? digits : `+${digits}`;
  }

  async sendOtp(phone: string, countryCode: string): Promise<string> {
    const to = this.normalize(phone, countryCode);
    if (!this.enabled) {
      this.logger.log(`[dev] OTP for ${to}: ${DEV_OTP_CODE}`);
      return 'pending';
    }
    const verification = await this.client!.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({ to, channel: 'sms' });
    return verification.status;
  }

  async verifyOtp(phone: string, countryCode: string, code: string): Promise<boolean> {
    const to = this.normalize(phone, countryCode);
    if (!this.enabled) {
      return code === DEV_OTP_CODE;
    }
    const check = await this.client!.verify.v2
      .services(this.verifyServiceSid)
      .verificationChecks.create({ to, code });
    return check.status === 'approved';
  }
}
