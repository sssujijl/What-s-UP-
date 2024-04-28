import { Controller, HttpStatus, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PlacesService } from 'src/places/places.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { ClovaocrService } from './clovaocr.service';
import { ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Clova OCR')
@Controller('clovaocr')
export class ClovaocrController {
    constructor(
        private readonly clovaocrService: ClovaocrService,
        private readonly placeService: PlacesService,
        private readonly reviewsService: ReviewsService
    ) { }

    /**
   * 영수증 인증
   * @returns
   */
    @Post('uploads')
    @UseInterceptors(FileInterceptor('file'))
    async validateReceipt(
        @UploadedFile() file: Express.Multer.File,
        @Query('placeId') placeId: number
    ) {
        try {
            const text = await this.clovaocrService.requestWithFile(file);
 
            const place = await this.placeService.findPlaceById(placeId);
            const data = await this.clovaocrService.test2(text, place);
            return {
                statusCode: HttpStatus.OK,
                message: '영수증 인증이 성공적으로 완료되었습니다.',
                data
              };
        } catch (err) {
            return { message: `${err}`}}
        }

    }
