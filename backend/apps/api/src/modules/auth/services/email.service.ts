import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  /**
   * 이메일 인증 코드 발송
   * TODO: 실제 이메일 발송 서비스 연동 (Nodemailer, SendGrid, AWS SES 등)
   */
  async sendVerificationCode(email: string, code: string): Promise<void> {
    // 개발 환경에서는 콘솔에 출력
    if (this.configService.get('NODE_ENV') === 'development') {
      this.logger.log(`[이메일 인증 코드] ${email}로 인증 코드 발송: ${code}`);
      this.logger.log(`인증 코드는 3분간 유효합니다.`);
      return;
    }

    // 프로덕션 환경에서는 실제 이메일 발송
    // TODO: Nodemailer 또는 다른 이메일 서비스 연동
    // 예시:
    // await this.nodemailerService.sendMail({
    //   to: email,
    //   subject: 'ZIPPER 이메일 인증 코드',
    //   html: `
    //     <h2>ZIPPER 이메일 인증</h2>
    //     <p>인증 코드: <strong>${code}</strong></p>
    //     <p>이 코드는 3분간 유효합니다.</p>
    //   `,
    // });

    this.logger.log(`[이메일 인증 코드] ${email}로 인증 코드 발송: ${code}`);
  }
}
