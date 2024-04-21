import { Controller, Post } from '@nestjs/common';
import { PlacesService } from 'src/places/places.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { ClovaocrService } from './clovaocr.service';
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Clova OCR')
@Controller('clovaocr')
export class ClovaocrController {
    constructor(
        private readonly clovaocrService: ClovaocrService,
        private readonly placeService: PlacesService,
        private readonly reviewsService: ReviewsService
    ) {}

    /**
   * 영수증 인증
   * @returns
   */
    @Post()
    async test() {
        const text = await this.clovaocrService.requestWithFile();
        const place = await this.placeService.findPlaceById(92);
        return await this.clovaocrService.test2(text, place);
    }
}