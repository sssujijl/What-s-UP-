import { Module } from '@nestjs/common';
import { PlacesModule } from 'src/places/places.module';
import { ReviewsService } from 'src/reviews/reviews.service';
import { ClovaocrController } from './clovaocr.controller';
import { ClovaocrService } from './clovaocr.service';

@Module({
  imports: [PlacesModule],
  controllers: [ClovaocrController],
  providers: [ClovaocrService, ReviewsService],
  exports: [ClovaocrService]
})
export class ClovaocrModule {}
