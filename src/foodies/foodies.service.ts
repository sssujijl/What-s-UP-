import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { CreateFoodieDto } from './dto/create-foodie.dto';
import { UpdateFoodieDto } from './dto/update-foodie.dto';
import { Foodie } from './entities/foodie.entity';

@Injectable()
export class FoodiesService {
 
  constructor(
    @InjectRepository(Foodie) private readonly foodieRepository: Repository<Foodie>
  ) {}

  async findOneById(id: number) {
    const foodie = await this.foodieRepository.findOneBy({ id });

    if (!foodie) {
      throw new NotFoundException('해당 맛집인을 찾을 수 없습니다.');
    }

    return foodie;
  }

  async createFoodie(createFoodieDto: CreateFoodieDto) {
    return await this.foodieRepository.save(createFoodieDto);
  }

  async findFoodie(id: number, req: Request): Promise<Foodie> {
    const ip = req.ip;
    const foodie = await this.foodieRepository.findOneBy({ id });

    if (!foodie) {
      throw new NotFoundException('해당 맛집인을 찾을 수 없습니다.');
    }

    // // 클라이언트의 IP주소와 조회한 게시글 ID를 저장하는 테이블에 저장
    // const isAlreadyViewed = await this.foodieRepository.checkIfViewed(ip, id);

    // if (!isAlreadyViewed) {
    //   // 중복 조회가 아닌 경우에만 조회수 증가
    //   foodie.views += 1;
    //   await this.foodieRepository.save(foodie);
    //   // 클라이언트의 IP 주소와 조회한 게시글 ID 저장
    //   await this.foodieRepository.saveViewedRecord(ip, id);
    // }
    return foodie
  }

  async findAllFoodies() {
    const foodie = await this.foodieRepository.find();

    if (!foodie) {
      throw new NotFoundException('맛집인 게시물을 찾을 수 없습니다.');
    }

    return foodie;
  }
    

  async updateFoodie(foodieId: number, userId: number, updateFoodieDto: UpdateFoodieDto) {
    const foodie = await this.findOneById(foodieId);

    if (foodie.userId !== userId) {
      throw new UnauthorizedException('해당 맛집인을 수정할 권한이 없습니다.')
    } 

    return await this.foodieRepository.update(foodieId, updateFoodieDto);
  }

  async deleteFoodie(foodieId: number, userId: number) {
    const foodie = await this.findOneById(foodieId);

    if (foodie.userId !== userId ) {
      throw new UnauthorizedException('해당 맛집인을 삭제할 권한이 없습니다.');
    }

    foodie.deletedAt = new Date();
    return await this.foodieRepository.save(foodie);
  }
}
