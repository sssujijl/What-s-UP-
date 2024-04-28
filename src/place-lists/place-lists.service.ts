import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePlaceListDto } from './dto/create-place-list.dto';
import { UpdatePlaceListDto } from './dto/update-place-list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaceList } from './entities/place-list.entity';
import { Repository } from 'typeorm';
import { Saved_Place } from './entities/savedPlaces.entity';
import { Visible } from './types/visible.type';
import { UsersService } from 'src/users/users.service';
import { PlacesService } from 'src/places/places.service';

@Injectable()
export class PlaceListsService {
  constructor(
    @InjectRepository(PlaceList)
    private readonly placeListRepository: Repository<PlaceList>,
    @InjectRepository(Saved_Place)
    private readonly savedPlaceRepository: Repository<Saved_Place>,
    private readonly userService: UsersService,
    private readonly placeService: PlacesService,
  ) {}

  async createPlaceList(createPlaceListDto: CreatePlaceListDto) {
    return await this.placeListRepository.save(createPlaceListDto);
  }

  async findPlaceListsByUserId(userId: number, nickName: string) {
    const author = await this.userService.findUserByNickName(nickName);

    let placeLists = [];

    if (userId === author.id) {
      placeLists = await this.placeListRepository.find({
        where: { userId: author.id },
        relations: ['savedPlaces', 'savedPlaces.place']
      });
    } else {
      placeLists = await this.placeListRepository.find({
        where: { userId: author.id, visible: Visible.public },
        relations: ['savedPlaces', 'savedPlaces.place']
      });
    }

    if (!placeLists) {
      throw new NotFoundException(
        '해당 유저의 장소리스트들을 찾을 수 없습니다.',
      );
    }

    return placeLists;
  }

  async findPlaceListById(placeListId: number, userId: number) {
    const placeList = await this.findMyPlaceList(placeListId);

    if (placeList.visible === Visible.private && placeList.userId !== userId) {
      throw new UnauthorizedException(
        '해당 유저는 장소리스트를 볼 수 있는 권한이 없습니다.',
      );
    }

    return placeList;
  }

  async findMyPlaceList(placeListId: number) {
    const placeList = await this.placeListRepository.findOneBy({
      id: placeListId,
    });

    if (!placeList) {
      throw new NotFoundException('해당 장소리스트를 찾을 수 없습니다.');
    }

    return placeList;
  }

  async editPlaceList(
    placeListId: number,
    updatePlaceListDto: UpdatePlaceListDto,
  ) {
    await this.findMyPlaceList(placeListId);

    return await this.placeListRepository.update(
      placeListId,
      updatePlaceListDto,
    );
  }

  async deletePlaceList(placeListId: number) {
    const placeList = await this.findMyPlaceList(placeListId);

    placeList.deletedAt = new Date();
    return await this.placeListRepository.save(placeList);
  }

  async savedPlace(placeListId: number, placeId: number) {
    await this.placeService.findPlaceById(placeId);

    return await this.savedPlaceRepository.save({ placeListId, placeId });
  }

  async canceledPlace(placeListId: number, placeId: number) {
    await this.placeService.findPlaceById(placeId);

    return await this.savedPlaceRepository.delete({ placeListId, placeId });
  }

  async changeSavedPlace(
    placeListId: number,
    placeId: number,
    newPlaceListId: number,
  ) {
    await this.placeService.findPlaceById(placeId);

    const placeList = await this.findMyPlaceList(newPlaceListId);

    return await this.savedPlaceRepository.update(
      { placeListId, placeId },
      {
        placeListId: placeList.id,
      },
    );
  }

  async savedPlaces(placeListId: number) {
    const savedPlaces = await this.savedPlaceRepository.find({
      where: { placeListId },
    });
    const placesId = savedPlaces.map((savedPlace) => savedPlace.placeId);
    return placesId;
  }
}
