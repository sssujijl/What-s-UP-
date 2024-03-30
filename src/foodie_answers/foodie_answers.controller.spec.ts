import { Test, TestingModule } from '@nestjs/testing';
import { FoodieAnswersController } from './foodie_answers.controller';
import { FoodieAnswersService } from './foodie_answers.service';

describe('FoodieAnswersController', () => {
  let controller: FoodieAnswersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodieAnswersController],
      providers: [FoodieAnswersService],
    }).compile();

    controller = module.get<FoodieAnswersController>(FoodieAnswersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
