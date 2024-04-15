import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { DataSource, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { CreateMissionDto } from './dto/create-mission.dto';
import { Time } from './types/mission_time.type';
import { PlacesService } from 'src/places/places.service';
import { Place } from 'src/places/entities/place.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
import { MessageProducer } from 'src/producer/producer.service';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class MissionsService {

  constructor(
    @InjectRepository(Mission) private readonly missionRepository: Repository<Mission>,
    @InjectRepository(Place) private readonly placeRepository: Repository<Place>,
    @InjectRepository(ResStatus) private readonly resStatusRepository: Repository<ResStatus>,
    private dataSource: DataSource,
    private readonly messageProducer: MessageProducer,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async findMission(id: number) {
    const mission =  await this.missionRepository.findOneBy({ id });

    if (!mission) {
      throw new NotFoundException('해당 미션을 찾을 수 없습니다.');
    }

    await this.messageProducer.sendMessage(`[${mission.date}] 미션이 생성되었습니다!!`);
    return mission;
  }

  async findTodayMission() {
    const today = new Date().toISOString().slice(0, 10);
    const mission = await this.missionRepository.findOneBy({ date: today });

    return mission;
  }

  async test() {
    return await this.resStatusRepository.find({where: {missionId: 14}});
  }

  // 10시 또는 15시에 랜덤으로 스케줄링 시작
  @Cron(`0 ${getRandom('01', '06')} * * *`)
  async createRandomMissions() {
    let createMissionDto: CreateMissionDto = {
      capacity: 0,
      date: '2024-04-09',
      time: Time.TEN_AM
    }
    createMissionDto.capacity = getRandomAttendees();

    createMissionDto.date = new Date().toISOString().slice(0, 10);
    const currentHour = new Date().getHours();

    if (currentHour === 10) {
      createMissionDto.time = Time.TEN_AM; // 12 ~ 15시
    } else {
      createMissionDto.time = Time.THREE_PM; // 17 ~ 20시
    }
    return await this.createMission(createMissionDto);
  }

  // 스케줄링을 통해서 실행되는 미션 생성 로직
  private async createMission(createMissionDto: CreateMissionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mission = await queryRunner.manager.save(Mission, createMissionDto);

      const placesByDong = await this.placesByDong();
      const selectedPlaceIds = await this.selectedPlaceIds(placesByDong);
      const resStatusIds = await this.checkAndRepeat(placesByDong, selectedPlaceIds, mission, 0);
      console.log(resStatusIds);
      await queryRunner.manager.update(ResStatus, resStatusIds, {missionId: mission.id});

      await queryRunner.commitTransaction();

      return mission;
    } catch (err) {
      return { message: `${err}` };
    }
  }

  // redis에 저장되어 있는 동별 placeIds 가져오기
  private async placesByDong() {
    const keys = await this.redis.keys('*동*');

    const placesByDong: { [key: string]: string[] } = {};

    await Promise.all(keys.map(async (key) => {
      const dong = key.replace('PlaceIds: ', '');
      const placeId = await this.redis.smembers(key);
      placesByDong[dong] = placeId;
    }));

    return placesByDong;
  }

  // 동별로 랜덤한 장소 아이디 선택
  private async selectedPlaceIds(placesByDong: { [key: string]: string[] }) {
    const selectedPlaces: { [key: string]: number } = {};

    for (const dong in placesByDong) {
      if (Object.prototype.hasOwnProperty.call(placesByDong, dong)) {
        const placesInDong = placesByDong[dong];
        const randomIndex = Math.floor(Math.random() * placesInDong.length);
        const selectedPlace = placesInDong[randomIndex];
        selectedPlaces[dong] = +selectedPlace;
      }
    }

    return selectedPlaces;
  }

  // 장소별 mission 인원수에 맞는 예약가능상태 확인, 찾을 때까지 반복
  private async checkAndRepeat(placesByDong: {}, selectedPlaceIds: {}, mission: Mission, count: number) {
    const resStatusId = await this.findResStatus(Object.values(selectedPlaceIds), mission);
    const { reSearch, availableResStatusIds } = await this.checkResStatus(selectedPlaceIds, resStatusId, mission.capacity);

    if (Object.keys(reSearch).length > 0) {
      const selectedPlaces = await this.selectedPlaceIds(placesByDong);

      if (count < 5) {
        await this.checkAndRepeat(placesByDong, selectedPlaces, mission, count+1);
      } else {
        return resStatusId
      }
    }

    return availableResStatusIds;
  }

  // 랜덤으로 장소의 mission.data, time에 맞는 resStatus 찾기
  private async findResStatus(placeIds: number[], mission: Mission) {
    let startTimeHour = '';
    let endTimeHour = '';
    if (mission.time === Time.TEN_AM) {
      (startTimeHour = '12'), (endTimeHour = '15');
    } else {
      (startTimeHour = '17'), (endTimeHour = '20');
    }

    const resStatus = await this.resStatusRepository
      .createQueryBuilder('resStatus')
      .where('resStatus.placeId IN (:...placeIds)', { placeIds })
      .andWhere('DATE(resStatus.dateTime) = :date', { date: mission.date })
      .andWhere('HOUR(resStatus.dateTime) BETWEEN :startTimeHour AND :endTimeHour', { startTimeHour, endTimeHour },)
      .andWhere('resStatus.status = :status', { status: true })
      .getRawMany();

    return resStatus;
  }

  // 찾은 resStatus가 mission.capacity보다 적은 동, placeId 걸러내기
  private async checkResStatus(selectedPlaces: any, resStatusList: any[], capacity: number) {
    const reSearch = [];
    const availableResStatusIds = [];

    for (const placeId of Object.values(selectedPlaces)) {
      const count = resStatusList.filter((resStatus) => resStatus.resStatus_placeId === +placeId);

      if (count.length < capacity) {
        reSearch.push(placeId);
      } else {
        const slicedCount = count.slice(0, capacity);
        slicedCount.forEach((resStatus) => availableResStatusIds.push(resStatus.resStatus_id));
      }
    }

    return { reSearch, availableResStatusIds };
  }










  // 만약 reStatus가 없는경우 다시 장소 랜덤찾기
  async reSearch(reSearch: {[dong: string]: number[]}) {
    let reSearchPlaces = [];

    for (const dong in reSearch) {
      const placeIds = reSearch[dong];
      const reSearchPlace = await this.placeRepository
        .createQueryBuilder('place')
        .where('place.address LIKE :dong', { dong: `%${dong}%`})
        .andWhere('place.id NOT IN (:...placeIds)', { placeIds })
        .select([
          "SUBSTRING_INDEX(SUBSTRING_INDEX(place.address, ' ', 3), ' ', -1) AS dong",
          'GROUP_CONCAT(place.id) AS placeId',
        ])
        .groupBy('dong')
        .getRawMany();
      
      reSearchPlaces = reSearchPlaces.concat(reSearchPlace);
    }

    const selectedPlaces = {};

    reSearchPlaces.forEach((place) => {
      const placesInDong = place.placeId.split(',');
      const dong = place.dong;
      const randomIndex = Math.floor(Math.random() * placesInDong.length);
      const selectedPlace = placesInDong[randomIndex];
      selectedPlaces[dong] = [];
      selectedPlaces[dong].push(selectedPlace);
    });

    return selectedPlaces;
  }

  // 랜덤 장소 찾기 (데이터베이스에서 동별로 분류하여 return, 랜덤으로 1 ~ 2곳 선택)
  async findByAddress() {
    const placesByDong = await this.placeRepository
      .createQueryBuilder('place')
      .select([
        "SUBSTRING_INDEX(SUBSTRING_INDEX(place.address, ' ', 3), ' ', -1) AS dong",
        'GROUP_CONCAT(place.id) AS placeId',
      ])
      .groupBy('dong')
      .getRawMany();

    const selectedPlaces = {};

    placesByDong.forEach((place) => {
      const placesInDong = place.placeId.split(',');
      const dong = place.dong;
      const randomIndex = Math.floor(Math.random() * placesInDong.length);
      const selectedPlace = placesInDong[randomIndex];
      selectedPlaces[dong] = [];
      selectedPlaces[dong].push(selectedPlace);
    });

    return selectedPlaces;
  }

  // 랜덤 장소 찾기 (전체 place를 조회하고, 동별로 분류하고, 랜덤하게 1 ~ 2곳 선택)
  async findAll() {
    const places = await this.placeRepository.find({
      select: ['id', 'address'],
    });

    const classifications = {};

    places.forEach((place) => {
      const match = place.address.match(/(\S+)동/);
      if (match) {
        const dong = match[0];
        if (!classifications[dong]) {
          classifications[dong] = [];
        }
        classifications[dong].push(place);
      }
    });

    const selectedPlaces = {};

    for (const dong in classifications) {
      if (classifications.hasOwnProperty(dong)) {
        const placesInDong = classifications[dong];
        const randomIndex = Math.floor(Math.random() * placesInDong.length);
        const selectedPlace = placesInDong[randomIndex];
        selectedPlaces[dong] = [];
        selectedPlaces[dong].push(selectedPlace.id);
      }
    }
    return selectedPlaces;
  }

  // 랜덤 장소 찾기 (데이터베이스에서 동별로 분류하고, 랜덤으로 2곳 선택)
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
          AS placeId`,
      ])
      .groupBy('dong')
      .getRawMany();

    return placesByDong;
  }

  random(number: number[]) {
    const index1 = Math.floor(Math.random() * number.length);
    const index2 = Math.random() > 0.5 ? Math.floor(Math.random() * number.length) : null;
    return index2 !== null ? [index1, index2] : [index1];
  }
  
}

function getRandom(a: string | number, b: string | number): string | number {
  return Math.random() > 0.5 ? a : b;
}

function getRandomAttendees(): number {
  return Math.floor(Math.random() * 3) + 1;
}
