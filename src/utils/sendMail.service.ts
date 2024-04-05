import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer'
import dotenv from 'dotenv'
import { SignupDto } from 'src/users/dto/signup.dto';

dotenv.config();

@Injectable()
export class sendMail {
  private transporter: Transporter

  constructor() {
    // Nodemailer transporter 생성
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASSWORD
      },
    });
  }

  // 이메일 보내는 메서드
  async sendEmail(to: string, subject: string, text: string, verificationCode: string) {
    try {
      const mailOptions = {
        from: process.env.My_Email,
        to: to,
        subject: '왓쩝에 가입하신걸 환영합니다!',
        text: `왓쩝 회원가입을 환영합니다! 아래 인증 코드를 입력하여 가입을 완료하세요! ${verificationCode}`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error occurred:', error);
      throw error;
    }
  }
  // 1. 메일발송시 랜덤 인증코드가 발송되야함
  // 2. 랜덤 인증코드를 만들어주는 로직 작성필요
  // 3. 그 로직을 verificationCode에 담아주면 끝

  // 인증 코드 생성 및 이메일 전송 메서드
  async sendVerificationCode(email: string) {
    try {
      // 무작위 인증 코드 생성
      const verificationCode = this.generateVerificationCode(6);

      // 이메일로 인증 코드 전송
      await this.sendEmail(
        email,
        'Verify Your Account',
        `Your verification code is: ${verificationCode}`,
        verificationCode
      );

      // 생성된 인증 코드 반환
      return verificationCode;
    } catch (error) {
      console.error('Error occurred:', error);
      throw error;
    }
  }

  generateVerificationCode(length: number) {
    let result = '';
    const characters = '0123456789'; // 인증 코드에 포함될 수 있는 문자열

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
  }

}



