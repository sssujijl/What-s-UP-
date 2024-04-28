import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { DataSource, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateMissionDto } from './dto/create-mission.dto';
import { Time } from './types/mission_time.type';
import { Place } from 'src/places/entities/place.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
import { MessageProducer } from 'src/producer/producer.service';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Reservation } from 'src/reservations/entities/reservation.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Status } from './types/status.types';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(ResStatus)
    private readonly resStatusRepository: Repository<ResStatus>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private dataSource: DataSource,
    private readonly messageProducer: MessageProducer,
    @InjectRedis() private readonly redis: Redis,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findMission(id: number) {
    const mission = await this.missionRepository.findOneBy({ id });

    if (!mission) {
      throw new NotFoundException('해당 미션을 찾을 수 없습니다.');
    }

    return mission;
  }

  async findTodayMission() {
    const today = new Date().toISOString().slice(0, 10);
    const mission = await this.cacheManager.get(`Mission: ${today}`);

    if (!mission) {
      throw new NotFoundException('오늘의 미션을 찾을 수 없습니다.');
    }

    return mission;
  }

  async findTodayMissionInfo() {
    const today = new Date().toISOString().slice(0, 10);

    const placeIds = await this.redis.smembers(`Mission: ${today}: placeIds`);
    const placesPromises = placeIds.map(async (placeId) => {
        return await this.cacheManager.get(`Mission: ${today}: place: ${placeId}`);
    });
    const places = await Promise.all(placesPromises);

    const resStatusIds = await this.redis.smembers(`Mission: ${today}: resStatusIds`);
    const resStatusPromises = resStatusIds.map(async (resStatusId) => {
        return await this.cacheManager.get(`Mission: ${today}: resStatus: ${resStatusId}`);
    });
    const resStatus = await Promise.all(resStatusPromises);

    return { places, resStatus };
  }

  async test() {
    return await this.messageProducer.sendMessage(
      `미션이 생성되었습니다!!`,
    );
    // return await this.messageProducer.subscriblePhoneToTopic('01065830878');
  }

  // 10시 또는 15시에 랜덤으로 스케줄링 시작
  @Cron(CronExpression.EVERY_HOUR)
  async createRandomMissions() {
    const currentHour = new Date().getHours();
    const today = new Date().toISOString().slice(0, 10);
    const mission = await this.cacheManager.get(`Mission: ${today}`);

    if (!mission) {

      if (currentHour === 15) {
        return await this.createMission(currentHour, today);

      } else if (currentHour === 10) {
        const random = getRandom();

        if (random === currentHour) {
          return await this.createMission(currentHour, today);
        }
      }
    }

    return console.log('아직 미션을 시작할 시간이 아닙니다.');
  }

  // 스케줄링을 통해서 실행되는 미션 생성 로직
  private async createMission(currentHour: number, today: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let createMissionDto: CreateMissionDto = {
        capacity: null,
        date: null,
        time: null
      };

      if (currentHour === 10) {
        createMissionDto.time = Time.TEN_AM; // 12 ~ 15시
      } else {
        createMissionDto.time = Time.THREE_PM; // 17 ~ 20시
      }

      createMissionDto.capacity = getRandomAttendees();
      createMissionDto.date = today;

      const mission = await queryRunner.manager.save(Mission, createMissionDto);

      const placesByDong = await this.placesByDong();
      const selectedPlaceIds = await this.selectedPlaceIds(placesByDong);
      const resStatusIds = await this.checkAndRepeat(
        placesByDong,
        selectedPlaceIds,
        mission,
        0,
      );

      await queryRunner.manager.update(ResStatus, resStatusIds, {
        missionId: mission.id,
      });

      await queryRunner.commitTransaction();

      const ttl = this.calculateTTL(mission.time);
      console.log(ttl);
      resStatusIds.map(async (resStatusId) => {
        const resStatus = await this.resStatusRepository.findOneBy({
          id: resStatusId,
        });
        await this.redis.sadd(`Mission: ${mission.date}: resStatusIds`, resStatus.id);
        await this.redis.expire(`Mission: ${mission.date}: resStatusIds`, ttl);
        await this.cacheManager.set(
          `Mission: ${mission.date}: resStatus: ${resStatus.id}`,
          resStatus,
          ttl,
        );

        const place = await this.placeRepository.findOne({
          where: {id: resStatus.placeId},
          relations: ['foodCategory', 'reviews']
        });
        await this.redis.sadd(`Mission: ${mission.date}: placeIds`, place.id);
        await this.redis.expire(`Mission: ${mission.date}: placeIds`, ttl);
        await this.cacheManager.set(`Mission: ${mission.date}: place: ${place.id}`, place, ttl);
      });

      await this.cacheManager.set(`Mission: ${mission.date}`, mission, ttl);
      await this.messageProducer.sendMessage(
        `[${mission.date}] 미션이 생성되었습니다!!`,
      );

      return mission;
    } catch (err) {
      return { message: `${err}` };
    }
  }

  // redis에 저장되어 있는 동별 placeIds 가져오기
  private async placesByDong() {
    const keys = await this.redis.keys('*동*');

    const placesByDong: { [key: string]: string[] } = {};

    await Promise.all(
      keys.map(async (key) => {
        const dong = key.replace('PlaceIds: ', '');
        const placeId = await this.redis.smembers(key);
        placesByDong[dong] = placeId;
      }),
    );

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
  private async checkAndRepeat(
    placesByDong: {},
    selectedPlaceIds: {},
    mission: Mission,
    count: number,
  ) {
    const resStatusId = await this.findResStatus(
      Object.values(selectedPlaceIds),
      mission,
    );
    const { reSearch, availableResStatusIds } = await this.checkResStatus(
      selectedPlaceIds,
      resStatusId,
      mission.capacity,
    );

    if (Object.keys(reSearch).length > 0) {
      const selectedPlaces = await this.selectedPlaceIds(placesByDong);

      if (count < 5) {
        await this.checkAndRepeat(
          placesByDong,
          selectedPlaces,
          mission,
          count + 1,
        );
      } else {
        return availableResStatusIds;
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
      .andWhere(
        'HOUR(resStatus.dateTime) BETWEEN :startTimeHour AND :endTimeHour',
        { startTimeHour, endTimeHour },
      )
      .andWhere('resStatus.status = :status', { status: true })
      .getRawMany();

    return resStatus;
  }

  // 찾은 resStatus가 mission.capacity보다 적은 동, placeId 걸러내기
  private async checkResStatus(
    selectedPlaces: any,
    resStatusList: any[],
    capacity: number,
  ) {
    const reSearch = [];
    const availableResStatusIds = [];

    for (const placeId of Object.values(selectedPlaces)) {
      const count = resStatusList.filter(
        (resStatus) => resStatus.resStatus_placeId === +placeId,
      );

      if (count.length < capacity) {
        reSearch.push(placeId);
      } else {
        const slicedCount = count.slice(0, capacity);
        slicedCount.forEach((resStatus) =>
          availableResStatusIds.push(resStatus.resStatus_id),
        );
      }
    }

    return { reSearch, availableResStatusIds };
  }

  async updateMissionStatus(missionId: number) {
    const mission = await this.missionRepository.findOne({
      where: { id: missionId },
    });
    const reviewCount = await this.getReviewCount(missionId);
    if (reviewCount >= mission.capacity) {
      mission.status = Status.GARDEN_FULL;
      return await this.missionRepository.save(mission);
    } else {
      mission.status = Status.BEFORE_MISSION;
      return await this.missionRepository.save(mission);
    }
  }

  private async getReviewCount(missionId: number): Promise<number> {
    const missionResStatus = await this.resStatusRepository.find({
      where: { missionId },
    });
    const reservations = [];
    for (const resStatus of missionResStatus) {
      const reservation = await this.reservationRepository.find({
        where: { resStatusId: resStatus.id },
      });
      reservations.push(...reservation);
    }
    const reviews = [];
    for (const reservation of reservations) {
      const currentReviews = await this.reviewRepository.find({
        where: { reservationId: reservation.id },
      });
      reviews.push(...currentReviews);
    }
    return reviews.length;
  }

  private calculateTTL(time: Time): number {
    if (time === Time.TEN_AM) {
      return 14 * 60 * 60;
    } else {
      return 9 * 60 * 60;
    }
  }
}

function getRandom() {
  return Math.random() > 0.5 ? 10 : 15;
}

function getRandomAttendees(): number {
  return Math.floor(Math.random() * 3) + 1;
}
