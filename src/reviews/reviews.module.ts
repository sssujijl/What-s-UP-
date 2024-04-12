import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { ClovaocrModule } from 'src/clovaocr/clovaocr.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), ClovaocrModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
