import { Test, TestingModule } from '@nestjs/testing';
import { FoodiesService } from './foodies.service';

describe('FoodiesService', () => {
  let service: FoodiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoodiesService],
    }).compile();

    service = module.get<FoodiesService>(FoodiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
