import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from './entities/point.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { TossPaymentDto } from './dto/toss.require.dto';
import { v4 } from 'uuid';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
  ) {}

  async createPoint(userId: number, point: number) {
    const points = await this.pointRepository.save({ userId, point });

    return points;
  }

  async findPoint(userId: number) {
    const points = await this.pointRepository.findOneBy({ userId });

    if (!points) {
      throw new NotFoundException('해당 유저의 포인트를 찾을 수 없습니다.');
    }

    return points;
  }

  async updatePoint(userId: number, totalAmount: number) {
    try {
      const point = await this.findPoint(userId);

      const newPoint = point.point - totalAmount;
      if (newPoint < 0) {
        throw new Error('현재 보유하고 있는 포인트 잔액이 부족합니다.');
      }

      await this.pointRepository.update({ userId }, { point: newPoint });
    } catch (error) {
      return { message: `${error}` };
    }
  }

  async cancelPoint(userId: number, totalAmount: number) {
    try {
      const point = await this.pointRepository.findOneBy({ userId });
      if (!point) {
        throw new NotFoundException('사용자의 포인트를 찾을 수 없습니다.');
      }

      const newPoint = point.point + totalAmount;

      await this.pointRepository.update({ userId }, { point: newPoint });
    } catch (error) {
      return { message: `${error}` };
    }
  }

  async requestPaymentToss(tossPaymentDto: TossPaymentDto, userId: number) {
    const secretKey = process.env.TOSS_SECRET_KEY;
    const IDEMPOTENCY_KEY = v4();

    const api_url = `https://api.tosspayments.com/v1/payments/confirm`;
    const headers = {
      Authorization: `Basic ${secretKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': IDEMPOTENCY_KEY,
    };
    try {
      const response = await axios.post(api_url, tossPaymentDto, { headers });
      const responseData = JSON.stringify(response.data);
      if (response.data.status === 'DONE') {
        const amount = response.data.totalAmount;
        await this.updatePoint(userId, -amount);
        console.log(`${amount} 포인트가 추가되었습니다.`);
      } else {
        console.log('결제가 완료되지 않았습니다.');
      }
      return responseData;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }

  async findPaymentToss(paymentKey: string) {
    const secretKey = process.env.TOSS_SECRET_KEY;

    const api_url = `https://api.tosspayments.com/v1/payments/${paymentKey}`;
    const headers = {
      Authorization: `Basic ${secretKey}`,
    };

    try {
      const response = await axios.get(api_url, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }

  async cancelPayment(
    userId: number,
    paymentKey: string,
    cancelReason: string,
    cancelAmount?: number,
  ) {
    const secretKey = process.env.TOSS_SECRET_KEY;

    const api_url = `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`;
    const headers = {
      Authorization: `Basic ${secretKey}`,
      'Content-Type': 'application/json',
    };
    const requestData = {
      cancelReason,
      cancelAmount,
    };

    try {
      const response = await axios.post(api_url, requestData, { headers });

      if (response.data.status === 'CANCELED') {
        const amount = response.data.totalAmount;
        await this.updatePoint(userId, amount);
        console.log('결제가 성공적으로 취소되었습니다.');
      } else {
        console.log('결제 취소에 실패하였습니다.');
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }

  async cancelPortOnePayment(merchant_uid: string) {
    try {
      const result = await axios.post('https://api.iamport.kr/users/getToken', {
        imp_key: process.env.IMP_KEY,
        imp_secret: process.env.IMP_SECRET,
      });
      const token = result.data.response.access_token;

      const data = {
        merchant_uid: merchant_uid,
        reason: '테스트 결제 환불',
      };
      const response = await axios.post(
        'https://api.iamport.kr/payments/cancel',
        data,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
