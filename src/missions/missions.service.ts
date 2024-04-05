import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { DataSource, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { CreateMissionDto } from './dto/create-mission.dto';
import { Time } from './types/mission_time.type';
import { PlacesService } from 'src/places/places.service';
import { Place } from 'src/places/entities/place.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(ResStatus)
    private readonly resStatusRepository: Repository<ResStatus>,
    private dataSource: DataSource,
    private placeService: PlacesService,
  ) {}

  async findMission(id: number) {
    return await this.missionRepository.findOneBy({ id });
  }

  // 10시 또는 15시에 랜덤으로 스케줄링 시작
  @Cron(`${getRandom('01', '06')} * * * *`)
  async createRandomMissions(createMissionDto: CreateMissionDto) {
    createMissionDto.capacity = getRandomAttendees();

    createMissionDto.date = new Date().toISOString().slice(0, 10);
    const currentHour = new Date().getHours();

    if (currentHour === 10) {
      createMissionDto.time = Time.TEN_AM; // 12 ~ 15시
    } else {
      createMissionDto.time = Time.THREE_PM; // 17 ~ 20시
    }

    await this.createMission(createMissionDto);
  }

  // 스케줄링을 통해서 실행되는 미션 생성 로직
  async createMission(createMissionDto: CreateMissionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mission = await queryRunner.manager.save(Mission, createMissionDto);

      // const selectedPlaces = await this.findAll(); // test 1
      const selectedPlaces = await this.findByAddress(); // test 2
      // const selectedPlaces = await this.randomPlace(); // test 3

      const resStatus = await this.findResStatus(Object.values(selectedPlaces), mission);
      
      const resStatusIds = await this.checkAndRepeat(selectedPlaces, resStatus, mission);

      return await queryRunner.manager.update(ResStatus, resStatusIds, {missionId: mission.id});
    } catch (err) {
      return { message: `${err}` };
    }
  }

  // 장소별 mission 인원수에 맞는 예약가능상태 확인, 찾을 때까지 반복
  async checkAndRepeat(selectedPlaces: any, resStatus: ResStatus[], mission: Mission) {
    const { reSearch, availableResStatusIds } = await this.checkResStatus(
      selectedPlaces, 
      resStatus, 
      mission.capacity
    );

    if (Object.keys(reSearch).length > 0) {
      const reSearchPlaces = await this.reSearch(reSearch);
      const reSearchReStatus = await this.findResStatus(Object.values(reSearchPlaces), mission);
      await this.checkAndRepeat(reSearchPlaces, reSearchReStatus, mission);
    }

    return availableResStatusIds;
  }

  // 랜덤으로 장소의 mission.data, time에 맞는 resStatus 찾기
  async findResStatus(placeIds: number[], mission: Mission) {
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
  async checkResStatus(selectedPlaces: any, resStatusList: any[], capacity: number) {

    const reSearch = {};
    const availableResStatusIds = [];

    for (const dong in selectedPlaces) {
      if (selectedPlaces.hasOwnProperty(dong)) {
        const placeIds = selectedPlaces[dong];
        const reSearchPlaceIds: number[] = [];
        const resStatusIds = [];

        for (const placeId of placeIds) {
          const count = resStatusList.filter((resStatus) => resStatus.resStatus_placeId === +placeId);
          count.map((filteredStatus) => resStatusIds.push(filteredStatus.resStatus_id));

          if (count.length < capacity) {
            reSearchPlaceIds.push(placeId);
          }
        }

        if (reSearchPlaceIds.length > 0) {
          reSearch[dong] = reSearchPlaceIds;
        } else if (resStatusIds) {
          availableResStatusIds.push(resStatusIds)
        }
      }
    }

    return { reSearch, availableResStatusIds};
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
}

function getRandom(a: string | number, b: string | number): string | number {
  return Math.random() > 0.5 ? a : b;
}

function getRandomAttendees(): number {
  return Math.floor(Math.random() * 3) + 1;
}
