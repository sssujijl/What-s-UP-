import { Test, TestingModule } from '@nestjs/testing';
import { FoodmatesController } from './foodmates.controller';
import { FoodmatesService } from './foodmates.service';

describe('FoodmatesController', () => {
  let controller: FoodmatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodmatesController],
      providers: [FoodmatesService],
    }).compile();

    controller = module.get<FoodmatesController>(FoodmatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
