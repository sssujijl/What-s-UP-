import { Module } from '@nestjs/common';
import { PlacesModule } from 'src/places/places.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { ClovaocrController } from './clovaocr.controller';
import { ClovaocrService } from './clovaocr.service';

@Module({
  imports: [PlacesModule, ReviewsModule],
  controllers: [ClovaocrController],
  providers: [ClovaocrService],
  exports: [ClovaocrService]
})
export class ClovaocrModule {}
