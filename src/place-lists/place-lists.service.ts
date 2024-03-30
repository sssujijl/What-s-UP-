import { Injectable } from '@nestjs/common';
import { CreatePlaceListDto } from './dto/create-place-list.dto';
import { UpdatePlaceListDto } from './dto/update-place-list.dto';

@Injectable()
export class PlaceListsService {
  create(createPlaceListDto: CreatePlaceListDto) {
    return 'This action adds a new placeList';
  }

  findAll() {
    return `This action returns all placeLists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} placeList`;
  }

  update(id: number, updatePlaceListDto: UpdatePlaceListDto) {
    return `This action updates a #${id} placeList`;
  }

  remove(id: number) {
    return `This action removes a #${id} placeList`;
  }
}
