import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import * as puppeteer from 'puppeteer';
import { CreateMenuDto } from 'src/menus/dto/create-menu.dto';
import { Menu } from 'src/menus/entities/menu.entity';
import { FoodCategory } from 'src/places/entities/foodCategorys.entity';
import { Place } from 'src/places/entities/place.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PuppeteerService {
  constructor(
    @InjectRepository(FoodCategory)
    private readonly foodCategoryRepository: Repository<FoodCategory>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async saveCategoryIfNotExists(category: string): Promise<FoodCategory> {
    const existingCategory = await this.foodCategoryRepository.findOne({
      where: { category: category },
    });
    if (!existingCategory) {
      const newCategory = this.foodCategoryRepository.create({
        category,
      });
      const foodCategory = await this.foodCategoryRepository.save(newCategory);

      return foodCategory;
    }
    return existingCategory;
  }

  async createRestaurant(restaurantData: {
    title: string;
    foodCategoryId: number;
    link: string;
    description: string;
    address: string;
    roadAddress: string;
    mapx: number;
    mapy: number;
    hasMenu: boolean;
  }) {
    const existingRestaurant = await this.placeRepository.findOne({
      where: { mapx: restaurantData.mapx, mapy: restaurantData.mapy },
    });

    if (existingRestaurant) {
      return existingRestaurant;
    }

    const newRestaurant = this.placeRepository.create(restaurantData);
    await this.placeRepository.save(newRestaurant);

    await this.savedRestaurantId(newRestaurant);

    return newRestaurant;
  }

  async savedRestaurantId(restaurant: Place) {
    const dong = restaurant.address.match(/\s(\S+동)\s/)[1];

    if (!dong) {
      return;
    }

    return await this.redis.sadd(`PlaceIds: ${dong}`, restaurant.id);
  }

  async createMenu(createMenuDto: CreateMenuDto) {
    const existingMenu = await this.menuRepository.findOne({
      where: { placeId: createMenuDto.placeId, name: createMenuDto.name },
    });

    if (existingMenu) {
      return existingMenu;
    }

    const newMenu = this.menuRepository.create(createMenuDto);
    return await this.menuRepository.save(newMenu);
  }

  private browser: puppeteer.Browser;

  async initialize() {
    this.browser = await puppeteer.launch();
  }

  async close() {
    await this.browser.close();
  }

  async getBrowserInstance(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      await this.initialize();
    }
    return this.browser;
  }
}
