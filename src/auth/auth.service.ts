import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userService: UsersService
    ) {}

    async createTokens(res: any, id: number) {
        const accessToken = await this.createAccessToken(id);
        const refreshToken = await this.createRefreshToken(id);

        res.cookie('accessToken', accessToken);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: this.configService.get('SECURE') !== 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/auth/refresh-token'
        });

        return accessToken;
    }

    async createAccessToken(id: number) {
        const accessToken = this.jwtService.sign(
            { id: id },
            {
                secret: this.configService.get('ACCESS_TOKEN_SECRET_KEY'),
                expiresIn: "12h" 
            },
          );
        
          return accessToken;
    }

    async createRefreshToken(id: number) {
        const refreshToken = this.jwtService.sign(
            { id: id },
            { 
                secret: this.configService.get('REFRESH_TOKEN_SECRET_KEY'),
                expiresIn: "7d" 
            },
          );
        
          return refreshToken;
    }

    async validateToken(token: string) {
        const sercetKey = this.configService.get('ACCESS_TOKEN_SECRET_KEY')
        const payload = this.jwtService.verify(token, { secret: sercetKey });

        const user = await this.userService.findUserById(payload.id);
        return user;
    }
}
