import { Strategy } from "passport-jwt";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req: any) => {
        const { accessToken } = req.cookies;

        return accessToken;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get("ACCESS_TOKEN_SECRET_KEY"),
    });
  }

  async validate(accessToken: any) {
    const user = await this.userService.findUserById(accessToken.id);

    if (!user) {
      throw new NotFoundException("해당하는 사용자를 찾을 수 없습니다.");
    }

    return user;
  }
}
