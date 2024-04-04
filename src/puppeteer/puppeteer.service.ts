import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as puppeteer from 'puppeteer';
import { FoodCategory } from 'src/places/entities/foodCategorys.entity';
import { Place } from 'src/places/entities/place.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class PuppeteerService {
  constructor(
    @InjectRepository(FoodCategory)
    private readonly foodCategoryRepository: Repository<FoodCategory>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
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

  async createRestaurant(restaurantData: any) {
    const {
      title,
      foodCategoryId,
      link,
      description,
      address,
      roadAddress,
      mapx,
      mapy,
    } = restaurantData;

    const existingRestaurant = await this.placeRepository.findOne({
      where: { mapx, mapy },
    });

    if (existingRestaurant) {
      return existingRestaurant;
    }

    const newRestaurant = this.placeRepository.create({
      title,
      foodCategoryId,
      link,
      description,
      address,
      roadAddress,
      mapx,
      mapy,
    });
    await this.placeRepository.save(newRestaurant);
    return newRestaurant;
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
