import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from './entities/point.entity';
import { Repository } from 'typeorm';
import { ReservationsService } from 'src/reservations/reservations.service';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Point) private readonly pointRepository: Repository<Point>
  ) {}

  async createPoint(userId: number, point: number) {
    const points = await this.pointRepository.save({
      userId, 
      point 
    });

    return points;
  }

  async findPoint(userId: number) {
    const points = await this.pointRepository.findOneBy({ userId });

    if (!points) {
      throw new NotFoundException('해당 유저의 포인트를 찾을 수 없습니다.');
    }

    return points
  }
}
