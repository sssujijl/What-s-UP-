import { Test, TestingModule } from '@nestjs/testing';
import { PlaceListsController } from './place-lists.controller';
import { PlaceListsService } from './place-lists.service';

describe('PlaceListsController', () => {
  let controller: PlaceListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaceListsController],
      providers: [PlaceListsService],
    }).compile();

    controller = module.get<PlaceListsController>(PlaceListsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
