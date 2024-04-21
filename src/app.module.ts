import Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TitlesModule } from './titles/titles.module';
import { FoodiesModule } from './foodies/foodies.module';
import { FoodieAnswersModule } from './foodie_answers/foodie_answers.module';
import { FoodmatesModule } from './foodmates/foodmates.module';
import { ChatRoomsModule } from './chat-rooms/chat-rooms.module';
import { MessagesModule } from './messages/messages.module';
import { CouponsModule } from './coupons/coupons.module';
import { PointsModule } from './points/points.module';
import { PlaceListsModule } from './place-lists/place-lists.module';
import { MissionsModule } from './missions/missions.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PlacesModule } from './places/places.module';
import { MenusModule } from './menus/menus.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FollowsModule } from './follows/follows.module';
import { User } from './users/entities/user.entity';
import { Point } from './points/entities/point.entity';
import { Saved_Place } from './place-lists/entities/savedPlaces.entity';
import { PlaceList } from './place-lists/entities/place-list.entity';
import { FoodCategory } from './places/entities/foodCategorys.entity';
import { Follow } from './follows/entities/follow.entity';
import { Coupon } from './coupons/entities/coupon.entity';
import { Mission } from './missions/entities/mission.entity';
import { Reservation } from './reservations/entities/reservation.entity';
import { Title } from './titles/entities/titles.entity';
import { User_ChatRoom } from './chat-rooms/entities/user_chatRoom.entity';
import { ChatRoom } from './chat-rooms/entities/chat-room.entity';
import { Message } from './messages/entities/message.entity';
import { Order_Menus } from './reservations/entities/orderMenus.entity';
import { Place } from './places/entities/place.entity';
import { Menu } from './menus/entities/menu.entity';
import { Review } from './reviews/entities/review.entity';
import { Foodie } from './foodies/entities/foodie.entity';
import { Foodie_Answer } from './foodie_answers/entities/foodie_answer.entity';
import { FoodMate } from './foodmates/entities/foodmate.entity';
import { User_FoodMate } from './foodmates/entities/user_foodmates.entity';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { ResStatus } from './reservations/entities/resStatus.entity';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ProducerModule } from './producer/producer.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import dotenv from 'dotenv';
import { ClovaocrModule } from './clovaocr/clovaocr.module';
import { RecommendModule } from './recommend/recommend.module';
import { EventGatewayModule } from './event-gateway/event-gateway.module';

dotenv.config();

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [
      User,
      Point,
      Saved_Place,
      PlaceList,
      FoodCategory,
      Follow,
      Coupon,
      Mission,
      Reservation,
      Title,
      User_ChatRoom,
      ChatRoom,
      Message,
      Order_Menus,
      Place,
      Menu,
      Review,
      Foodie,
      Foodie_Answer,
      FoodMate,
      User_FoodMate,
      ResStatus,
      Order_Menus
    ],
    synchronize: configService.get('DB_SYNC'),
    logging: true
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: process.env.REDIS_URL
      })
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UsersModule,
    AuthModule,
    TitlesModule,
    FoodiesModule,
    FoodieAnswersModule,
    FoodmatesModule,
    ChatRoomsModule,
    MessagesModule,
    CouponsModule,
    PointsModule,
    PlaceListsModule,
    MissionsModule,
    ReservationsModule,
    PlacesModule,
    MenusModule,
    ReviewsModule,
    FollowsModule,
    PuppeteerModule,
    ClovaocrModule,
    ProducerModule,
    RecommendModule,
    EventGatewayModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}