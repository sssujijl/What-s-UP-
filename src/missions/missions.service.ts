import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { CreateMissionDto } from './dto/create-mission.dto';
import { DateTime } from './types/dateTime.type';

@Injectable()
export class MissionsService {
  constructor (
    @InjectRepository(Mission) private readonly missionRepository: Repository<Mission>
  ) {}

  @Cron(`${getRandomHour()} * * * *`)
  async createRandomMissions(createMissionDto: CreateMissionDto) {
    createMissionDto.capacity = getRandomAttendees();

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    if (currentHour === 7) {
      createMissionDto.dateTime = DateTime.TEN_AM;
    } else {
      createMissionDto.dateTime = DateTime.THREE_PN;
    }

  }

  async createMission() {

  }
}

function getRandomHour(): string {
  return Math.random() > 0.5 ? '07' : '12';
}

function getRandomAttendees(): number {
  return Math.floor(Math.random() * 5) + 1;
}

