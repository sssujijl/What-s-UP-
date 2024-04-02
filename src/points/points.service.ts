import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from './entities/point.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Point) private readonly pointRepository: Repository<Point>
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

    return points
  }

  async updatePoint(userId: number, totalAmount: number) {
    try {
      const point = await this.findPoint(userId);

      const newPoint = point.point - totalAmount;
      if (newPoint < 0) {
        throw new Error("현재 보유하고 있는 포인트 잔액이 부족합니다.");
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
        throw new NotFoundException("사용자의 포인트를 찾을 수 없습니다.");
      }

      const newPoint = point.point + totalAmount;

      await this.pointRepository.update({ userId }, { point: newPoint });
    } catch (error) {
      return { message: `${error}` };
    }
  }
}
