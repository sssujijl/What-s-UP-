import { Module } from '@nestjs/common';
import { PlacesModule } from 'src/places/places.module';
import { ClovaocrController } from './clovaocr.controller';
import { ClovaocrService } from './clovaocr.service';

@Module({
  imports: [PlacesModule],
  controllers: [ClovaocrController],
  providers: [ClovaocrService]
})
export class ClovaocrModule {}
