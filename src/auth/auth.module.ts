import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { PlaceListsModule } from 'src/place-lists/place-lists.module';
import { AuthorStrategy } from './author.strategy';
import { JwtGoogleStrategy } from './google.strategy';
import { JwtNaverStrategy } from './naver.strategy';
import { JwtKakaoStrategy } from './kakao.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET_KEY"),
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => PlaceListsModule)
  ],
  controllers: [],
  providers: [
    AuthService, 
    JwtStrategy, 
    AuthorStrategy,
    JwtGoogleStrategy,
    JwtNaverStrategy,
    JwtKakaoStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
