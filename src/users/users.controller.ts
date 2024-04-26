import { Controller, Get, Post, Body, Patch, Delete, Res, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { validate } from 'class-validator';
import { SignupDto } from './dto/signup.dto';
import { signinDto } from './dto/signin.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from './entities/user.entity';
import { EditUserDto } from './dto/editUser.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendMailService } from 'src/users/sendMail.service';
import { CheckVerification } from './dto/checkVerification.dto';
import { CheckDuplicateDto } from './dto/checkDuplicate.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly sendMailService: SendMailService
  ) {}

  /**
   * 회원가입
   * @returns
   */
  @Post('signup')
  async signup(
    @Body() signupDto: SignupDto) {
    try {
      console.log(signupDto);
     const newUser = await this.usersService.signup(signupDto);
 
     return newUser;
   } catch (err) {
     return { message: `${err}` };
   }
  }

  /**
   * 인증메일 발송
   * @param email
   * @returns
   */
  @Post('/sendMail')
  async sendMailVerificationCode(@Body('email') email: string) {
    try {
      await this.sendMailService.addMailerQueue(email);

      return { message: `${email} 로 인증메일을 발송하였습니다.` }
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 인증메일 확인
   * @returns
   */
  @Post('/checkVerification')
  async checkVerificationCode(@Body() checkVerification: CheckVerification) {
    try {
      await this.usersService.checkVerificationCode(checkVerification);

      return { message: '인증이 완료되었습니다.' };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 이메일, 비밀번호, 휴대전화번호 중복확인
   * @returns
   */
  @Post('/checkDuplicate')
  async checkDuplicate(
    @Body() data: CheckDuplicateDto,
    @Res() res: any
  ) {
    try {
      console.log(data);
      const result = await this.usersService.checkDuplicate(data);
      console.log(result);
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ message: `${err}` });
    }
  }

  /**
   * 로그인
   * @returns
   */
  @Post('signin')
  async signin(
    @Body() signinDto: signinDto,
    @Res() res: any
  ) {
    try {
      await validate(signinDto);

      const user = await this.usersService.signin(signinDto);

      await this.authService.createTokens(res, user.id);
      
      return res.json(user);
    } catch (err) {
      return res.json({ message: `${err}` });
    }
  }

    /**
   * 유저 정보 조회
   * @returns
   */
    @UseGuards(AuthGuard("jwt"))
    @Get()
    async findUser(
      @UserInfo() user: User,
    ) {
      try {
        return user;
      } catch (err) {
        return { message: `${err}` }
      }
    }

  /**
   * 유저 정보 조회
   * @returns
   */
  @UseGuards(AuthGuard("jwt"))
  @Post('info')
  async getUser(
    @UserInfo() user: User,
    @Body('password') password: string
  ) {
    try {
      console.log(password)
      return await this.usersService.getUser(user, password);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 유저 전체 정보 조회
   * @returns
   */
    @UseGuards(AuthGuard("jwt"))
    @Get('info')
    async getUserInfo(@UserInfo() user: User) {
      try {
        return await this.usersService.getUserInfo(user.id);
      } catch (err) {
        return { message: `${err}` }
      }
    }

  /**
   * 유저 정보 수정
   * @returns 
   */
  @UseGuards(AuthGuard("jwt"))
  @Patch()
  async editUser(
    @UserInfo() user: User,
    @Body() editUserDto: EditUserDto
  ) {
    try {
      const editUser = await this.usersService.editUser(user.id, editUserDto);

      return editUser;
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 탈퇴
   * @returns 
   */
  @UseGuards(AuthGuard("jwt"))
  @Delete()
  async secession(
    @UserInfo() user: User,
    @Body('password') password: string,
    @Res() res: any
  ) {
    try {
      await this.usersService.secession(user, password);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return { message: `${user.name} 님이 정상적으로 탈퇴되었습니다.`};
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 구글 로그인
   * @returns
   */
  @UseGuards(AuthGuard("google"))
  @Get("/signin/google")
	async loginGoogle(
    @Req() req: any,
    @Res() res: any	
  ) {
    const user = await this.usersService.socialLogin(req, res);

    await this.authService.createTokens(res, user.id);

    return res.json({ message: "로그인이 완료되었습니다." });
  }

  @UseGuards(AuthGuard("google"))
  @Get('/callback/google')
  async googleCallback(@Req() req: any, @Res() res: any) {
    console.log('-------------', req.user);
    const user = await this.usersService.socialLogin(req, res);

    await this.authService.createTokens(res, user.id);

    return res.json({ message: "로그인이 완료되었습니다." });
  }

  /**
   * 네이버 로그인
   * @returns
   */
  @UseGuards(AuthGuard("naver"))
  @Get('/signin/naver')
  async signinNaver(
    @Req() req: any,
    @Res() res: any	
  ) {
    try {
      const user = await this.usersService.socialLogin(req, res);
      await this.authService.createTokens(res, user.id);
  
      return res.json({ message: "로그인이 완료되었습니다." });
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard("naver"))
  @Get('/callback/naver')
  async naverCallback(@Req() req: any, @Res() res: any) {
    res.redirect('/users')
  }

  /**
   * 카카오 로그인
   * @returns
   */
  @UseGuards(AuthGuard("kakao"))
  @Get('/signin/kakao')
  async signinKakao() {
    try {
      return;
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard("kakao"))
  @Get('/callback/kakao')
  async kakaoCallback(@Req() req: any, @Res() res: any) {
    res.redirect('/users')
  }
}
