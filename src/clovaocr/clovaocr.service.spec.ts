import { Test, TestingModule } from '@nestjs/testing';
import { ClovaocrService } from './clovaocr.service';

describe('ClovaocrService', () => {
  let service: ClovaocrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClovaocrService],
    }).compile();

    service = module.get<ClovaocrService>(ClovaocrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
