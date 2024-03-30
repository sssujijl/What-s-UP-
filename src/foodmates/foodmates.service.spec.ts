import { Test, TestingModule } from '@nestjs/testing';
import { FoodmatesService } from './foodmates.service';

describe('FoodmatesService', () => {
  let service: FoodmatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoodmatesService],
    }).compile();

    service = module.get<FoodmatesService>(FoodmatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
