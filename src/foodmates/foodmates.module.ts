import { Module } from '@nestjs/common';
import { FoodmatesService } from './foodmates.service';
import { FoodmatesController } from './foodmates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FoodMate } from './entities/foodmate.entity';
import { ChatRoomsModule } from 'src/chat-rooms/chat-rooms.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, FoodMate]), ChatRoomsModule],
  controllers: [FoodmatesController],
  providers: [FoodmatesService],
})
export class FoodmatesModule {}
