import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { DataSource, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { CreateMissionDto } from './dto/create-mission.dto';
import { DateTime } from './types/dateTime.type';
import { PlacesService } from 'src/places/places.service';

@Injectable()
export class MissionsService {
  constructor (
    @InjectRepository(Mission) private readonly missionRepository: Repository<Mission>,
    private dataSource: DataSource,
    private placeService: PlacesService
  ) {}

  @Cron(`${getRandomHour()} * * * *`)
  async createRandomMissions(createMissionDto: CreateMissionDto) {
    createMissionDto.capacity = getRandomAttendees();

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    if (currentHour === 13) {
      createMissionDto.dateTime = DateTime.TEN_AM;
    } else {
      createMissionDto.dateTime = DateTime.THREE_PN;
    }

    await this.createMission(createMissionDto);
  }

  async createMission(createMissionDto: CreateMissionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{
      const mission = await queryRunner.manager.save(Mission, createMissionDto);


    } catch (err) {
      return { message: `${err}` }
    }
  }
}

function getRandomHour(): string {
  return Math.random() > 0.5 ? '13' : '18';
}

function getRandomAttendees(): number {
  return Math.floor(Math.random() * 5) + 1;
}

