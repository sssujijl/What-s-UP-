import { Strategy } from "passport-jwt";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { UsersService } from "src/users/users.service";
import { PlaceListsService } from "src/place-lists/place-lists.service";

@Injectable()
export class AuthorStrategy extends PassportStrategy(Strategy, "author") {
  constructor(
    private readonly userService: UsersService,
    private readonly placeListService: PlaceListsService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req: any) => {
        const { accessToken } = req.cookies;
        const { placeListId } = req.params

        return {accessToken, placeListId};
      },
      ignoreExpiration: false,
      secretOrKey: configService.get("ACCESS_TOKEN_SECRET_KEY"),
    });
  }

  async validate(accessToken: any, placeListId: number) {
    const user = await this.userService.findUserById(accessToken.id);

    if (!user) {
      throw new NotFoundException("해당하는 사용자를 찾을 수 없습니다.");
    }

    const placeList = await this.placeListService.findMyPlaceList(placeListId);

    if (placeList.userId !== user.id) {
        throw new UnauthorizedException('해당 장소리스트에 대한 권한이 없습니다.');
    }

    return { user, placeList};
  }
}
