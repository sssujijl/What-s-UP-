import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";

export class JwtKakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACKURL,
      scope: ["account_email", "profile_nickname"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('accessToken'+accessToken)
    console.log('refreshToken'+refreshToken)
    console.log(profile)
    console.log(profile._json.kakao_account.email)

    return {
      name: profile.displayName,
      email: profile._json.kakao_account.email,
      password: profile.id,
    };
  }
}