import { Test, TestingModule } from '@nestjs/testing';
import { ClovaocrController } from './clovaocr.controller';

describe('ClovaocrController', () => {
  let controller: ClovaocrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClovaocrController],
    }).compile();

    controller = module.get<ClovaocrController>(ClovaocrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
