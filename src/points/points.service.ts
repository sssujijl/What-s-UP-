import { Injectable } from '@nestjs/common';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from './entities/point.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Point) private readonly pointRepository: Repository<Point>
  ) {}

  async createPoint(userId: number, point: number) {
    console.log('------', userId, point);
    const points = await this.pointRepository.save({
      userId, 
      point 
    });

    return points;
  }
}
