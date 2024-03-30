import Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
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
import { LikesModule } from './likes/likes.module';
import { PlacesModule } from './places/places.module';
import { MenusModule } from './menus/menus.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FollowsModule } from './follows/follows.module';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [],
    synchronize: configService.get('DB_SYNC'),
    logging: true,
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
    LikesModule,
    PlacesModule,
    MenusModule,
    ReviewsModule,
    FollowsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}