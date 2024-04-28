import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu) private readonly menuRepository: Repository<Menu>
  ) {}

  async findByPlaceIdAndMenuIds(placeId: number, menuIds: number[]) {
    const menus = await this.menuRepository.find({
      where: {
        placeId,
        id: In(menuIds),
      }
    });

    if (!menus || menuIds.length !== menus.length) {
      throw new NotFoundException('해당 가게의 메뉴들을 찾을 수 없습니다.');
    }

    return menus;
  }

  async findAllMenuByPlaceId(placeId: number) {
    const menus = await this.menuRepository.findBy({ placeId });

    if (!menus || menus.length === 0) {
      throw new NotFoundException('해당 가게의 메뉴정보들을 찾을 수 없습니다.');
    }

    return menus;
  }
}
