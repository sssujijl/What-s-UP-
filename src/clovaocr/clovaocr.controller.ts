import { Controller, Get, Post } from '@nestjs/common';
import { ClovaocrService } from './clovaocr.service';

@Controller('clovaocr')
export class ClovaocrController {
    constructor(
        private readonly clovaocrService: ClovaocrService
    ) {}

    @Post()
    async test() {
        return await this.clovaocrService.requestWithFile();
    }
}
