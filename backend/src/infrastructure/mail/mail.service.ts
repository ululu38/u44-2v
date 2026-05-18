import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.pass'),
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: '"U44 Admin" <no-reply@u44tech.com>',
        to,
        subject,
        text,
        html,
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async notifyAllAdmins(subject: string, content: string, adminEmails: string[]): Promise<boolean> {
    const promises = adminEmails.map(email => 
      this.sendEmail(email, subject, content, `<h1>${subject}</h1><p>${content}</p>`)
    );
    const results = await Promise.all(promises);
    return results.every(res => res === true); // คืนค่า true ถ้าส่งผ่านทุกคน
  }
}
