import { Module } from '@nestjs/common';
import { PlacesModule } from 'src/places/places.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { ClovaocrController } from './clovaocr.controller';
import { ClovaocrService } from './clovaocr.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
    PlacesModule,
    ReviewsModule,
  ],
  controllers: [ClovaocrController],
  providers: [ClovaocrService],
  exports: [ClovaocrService],
})
export class ClovaocrModule {}
