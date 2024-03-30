import { Test, TestingModule } from '@nestjs/testing';
import { PlaceListsService } from './place-lists.service';

describe('PlaceListsService', () => {
  let service: PlaceListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaceListsService],
    }).compile();

    service = module.get<PlaceListsService>(PlaceListsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
