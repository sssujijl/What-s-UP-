import { Test, TestingModule } from '@nestjs/testing';
import { FoodieAnswersService } from './foodie_answers.service';

describe('FoodieAnswersService', () => {
  let service: FoodieAnswersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoodieAnswersService],
    }).compile();

    service = module.get<FoodieAnswersService>(FoodieAnswersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
