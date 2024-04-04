import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { DataSource, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { CreateMissionDto } from './dto/create-mission.dto';
import { DateTime } from './types/dateTime.type';
import { PlacesService } from 'src/places/places.service';
import { Place } from 'src/places/entities/place.entity';

@Injectable()
export class MissionsService {
  constructor (
    @InjectRepository(Mission) private readonly missionRepository: Repository<Mission>,
    @InjectRepository(Place) private readonly placeRepository: Repository<Place>,
    private dataSource: DataSource,
    private placeService: PlacesService
  ) {}

  // 10시 또는 15시에 랜덤으로 스케줄링 시작
  @Cron(`${getRandom('13', '18')} * * * *`)
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

  // 스케줄링을 통해서 실행되는 미션 생성 로직
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

  // 전체 place를 조회하고, 동별로 분류하고, 랜덤하게 1 ~ 2곳 선택
  async findAll() {
    const places = await this.placeRepository.find();

    const classifications = {};

    places.forEach((place) => {
      const match = place.address.match(/(\S+)동/);
      // place.address.match(/(\S+)동(?!\S)/);
      if (match) {
        const dong = match[1];
        if (!classifications[dong]) {
          classifications[dong] = [];
        }
        classifications[dong].push(place);
      }
    });

    const selectedPlaces = [];

    for (const dong in classifications) {
      if (classifications.hasOwnProperty(dong)) {
        const placesInDong = classifications[dong];
        const randomIndex = Math.floor(Math.random() * placesInDong.length);
        console.log(randomIndex)
        const selectedPlace = placesInDong[randomIndex];
        selectedPlaces.push(selectedPlace);
      }
    }

    return selectedPlaces;
  }

  // 데이터베이스에서 동별로 분류하여 return, 랜덤으로 1 ~ 2곳 선택
  async findByAddress() {
    const placesByDong = await this.placeRepository
        .createQueryBuilder('place')
        .select([
          "SUBSTRING_INDEX(SUBSTRING_INDEX(place.address, ' ', 3), ' ', -1) AS dong",
          'GROUP_CONCAT(place.id) AS placeId'
        ])
        .groupBy("dong")
        .getRawMany();

    const selectedPlaces = [];

    placesByDong.forEach((place) => {
      const placesInDong = place.placeId.split(',');
      const randomIndex = Math.floor(Math.random() * placesInDong.length);
      const selectedPlace = placesInDong[randomIndex];
      selectedPlaces.push(selectedPlace);
    });

    return selectedPlaces;
  }

  // 데이터베이스에서 동별로 분류하고, 랜덤으로 2곳 선택
  // async randomPlace() {
  //   const placesByDong = await this.placeRepository
  //     .createQueryBuilder('place')
  //     .select([
  //       "SUBSTRING_INDEX(SUBSTRING_INDEX(place.address, ' ', 3), ' ', -1) AS dong",
  //       `GROUP_CONCAT(place.id ORDER BY RAND() LIMIT ${getRandom(1, 2)}) AS placeId`
  //     ])
  //     .groupBy("dong")
  //     // .orderBy('RAND()')
  //     // .addOrderBy('RAND()')
  //     // .limit(Number(getRandom(1, 2)))
  //     .getRawMany();

  //   return placesByDong;
  // }

  async randomPlace() {
    const placesByDong = await this.placeRepository
      .createQueryBuilder('place')
      .select([
        "SUBSTRING_INDEX(SUBSTRING_INDEX(place.address, ' ', 3), ' ', -1) AS dong", 
        `(SELECT GROUP_CONCAT(placeId ORDER BY RAND()) 
          FROM (SELECT place.id AS placeId 
          FROM places place 
          WHERE place.deletedAt IS NULL 
          AND SUBSTRING_INDEX(SUBSTRING_INDEX(place.address, ' ', 3), ' ', -1) = dong 
          ORDER BY RAND() 
          LIMIT ${getRandom(1, 2)}) AS randomPlaces) 
          AS placeId`
      ])
      .groupBy('dong')
      .getRawMany();
  
    return placesByDong;
  }
  
  
}

function getRandom(a: string | number, b: string | number): string | number {
  return Math.random() > 0.5 ? a : b;
}

function getRandomAttendees(): number {
  return Math.floor(Math.random() * 5) + 1;
}

