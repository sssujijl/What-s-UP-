import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import _ from 'lodash';
import * as puppeteer from 'puppeteer';
import { CreateMenuDto } from 'src/menus/dto/create-menu.dto';
import { Menu } from 'src/menus/entities/menu.entity';
import { FoodCategory } from 'src/places/entities/foodCategorys.entity';
import { Place } from 'src/places/entities/place.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
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
    @InjectRedis() private readonly redis: Redis,
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
      await this.groupByMainCategory(foodCategory);
      return foodCategory;
    }

    return existingCategory;
  }

  async groupByMainCategory(foodCategory: FoodCategory) {
    const text = foodCategory.category.split(',');

    const categoriesMap = {
      Korean: [
        '한식',
        '국',
        '순댓국',
        '샤브샤브',
        '백숙',
        '삼계탕',
        '찌개',
        '전골',
        '전',
        '닭볶음탕',
        '낙지',
        '전통',
        '찜',
        '밥',
        '탕',
        '두부',
        '국수',
        '한정식',
        '요리',
        '만두',
      ],
      Western: ['양식', '파스타', '스파게티', '스테이크', '이탈리아'],
      Chinese: ['중식', '중식당', '마라'],
      Japanese: [
        '일식',
        '회',
        '초밥',
        '이자카야',
        '일본식',
        '일식당',
        '우동',
        '소바',
        '라멘',
        '돈가스',
      ],
      Asian: ['아시아', '쌀국수', '퓨전음식'],
      NightFood: [
        '바',
        '술집',
        '요리주점',
        '포장마차',
        '맥주',
        '호프',
        '닭발',
        '와인',
      ],
      Snack: ['떡볶이', '순대', '오뎅', '분식', '김밥'],
      FastFood: ['햄버거', '피자', '치킨'],
      Dessert: ['카페', '베이커리', '디저트', '빵', '케이크'],
      Meat: ['돼지', '소', '양', '닭', '구이', '고기', '갈비', '육류'],
    };

    for (const textItem of text) {
      for (const [mainCategory, keywords] of Object.entries(categoriesMap)) {
        if (keywords.some((word) => textItem.includes(word))) {
          return await this.redis.sadd(`FoodCategory: ${mainCategory}`, `${foodCategory.id}: ${foodCategory.category}`);
        }
      }
    }
  }

  async isExistingRestaurant(title: string, address: string) {
    const existingRestaurant = await this.placeRepository.findOne({
      where: { title: title, address: address },
    });
    return existingRestaurant;
  }

  async createRestaurant(restaurantData: {
    title: string;
    foodCategoryId: number;
    link: string;
    address: string;
    roadAddress: string;
    hasMenu: boolean;
  }) {
    const existingRestaurant = await this.isExistingRestaurant(
      restaurantData.title,
      restaurantData.address,
    );

    if (existingRestaurant) {
      console.log('이미 있는데요?');
      return null;
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
