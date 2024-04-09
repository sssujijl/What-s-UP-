import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import * as puppeteer from 'puppeteer';
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
      return await this.foodCategoryRepository.save(newCategory);
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

  async createMenu(menuData: {
    placeId: number;
    name: string;
    image: string;
    description: string;
    price: string;
  }) {
    const existingMenu = await this.menuRepository.findOne({
      where: { placeId: menuData.placeId, name: menuData.name },
    });

    if (existingMenu) {
      return existingMenu;
    }

    const newMenu = this.menuRepository.create(menuData);
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
