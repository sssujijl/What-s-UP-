import { Controller, Post } from '@nestjs/common';
import { PlacesService } from 'src/places/places.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { ClovaocrService } from './clovaocr.service';

@Controller('clovaocr')
export class ClovaocrController {
    constructor(
        private readonly clovaocrService: ClovaocrService,
        private readonly placeService: PlacesService,
        private readonly reviewsService: ReviewsService
    ) {}

    @Post()
    async test() {
        const text = await this.clovaocrService.requestWithFile();
        const place = await this.placeService.findPlaceById(87);
        return await this.clovaocrService.test2(text, place);
    }
}