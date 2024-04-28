import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Res,
  UseGuards,
  Req,
  HttpStatus,
  Query,
} from '@nestjs/common';
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
import { AdditionalInfoDto } from './dto/additionalInfo.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly sendMailService: SendMailService,
  ) {}

  /**
   * 회원가입
   * @returns
   */
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    try {
      const data = await this.usersService.signup(signupDto);

      return {
        statusCode: HttpStatus.OK,
        message: '장소리스트를 성공적으로 옮겼습니다.',
        data,
      };
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
      const data = await this.sendMailService.addMailerQueue(email);

      return {
        statusCode: HttpStatus.OK,
        message: `${email} 로 인증메일을 발송하였습니다.`,
        data,
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 인증메일 확인
   * @returns
   */
  @Post('/checkVerification')
  async checkVerificationCode(@Body() checkVerification: CheckVerification) {
    try {
      const data =
        await this.usersService.checkVerificationCode(checkVerification);

      return {
        statusCode: HttpStatus.OK,
        message: '인증이 완료되었습니다.',
        data,
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 이메일, 비밀번호, 휴대전화번호 중복확인
   * @returns
   */
  @Post('/checkDuplicate')
  async checkDuplicate(@Body() check: CheckDuplicateDto) {
    try {
      const data = await this.usersService.checkDuplicate(check);

      return {
        statusCode: HttpStatus.OK,
        message: '중복되는 유저가 없습니다.',
        data,
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 로그인
   * @returns
   */
  @Post('signin')
  async signin(@Body() signinDto: signinDto, @Res() res: any) {
    try {
      await validate(signinDto);

      const data = await this.usersService.signin(signinDto);

      await this.authService.createTokens(res, data.id);

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: '로그인 하였습니다.',
      });
    } catch (err) {
      return res.json({ message: `${err}` });
    }
  }

  /**
   * 유저 정보 조회
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findUser(@UserInfo() user: User) {
    try {
      return user;
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 유저 정보 조회
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('info')
  async getUser(@UserInfo() user: User, @Body('password') password: string) {
    try {
      const data = await this.usersService.getUser(user, password);
      return {
        statusCode: HttpStatus.OK,
        message: '유저정보를 성공적으로 조회하였습니다.',
        data,
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 유저 전체 정보 조회
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('info')
  async getUserInfo(@UserInfo() user: User) {
    try {
      const data = await this.usersService.getUserInfo(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '전체유저정보를 성공적으로 조회하였습니다.',
        data,
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 유저 정보 수정
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async editUser(@UserInfo() user: User, @Body() editUserDto: EditUserDto) {
    try {
      const data = await this.usersService.editUser(user.id, editUserDto);
      return {
        statusCode: HttpStatus.OK,
        message: '프로필을 성공적으로 수정하였습니다.',
        data,
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 탈퇴
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('/delete')
  async secession(
    @UserInfo() user: User,
    @Body('password') password: string,
    @Res() res: any,
  ) {
    try {
      await this.usersService.secession(user, password);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res
        .status(HttpStatus.OK)
        .json({ message: `${user.name} 님이 정상적으로 탈퇴되었습니다.` });
    } catch (err) {
      return res.json({ message: `${err}` });
    }
  }

  /**
   * 구글 로그인
   * @returns
   */
  @UseGuards(AuthGuard('google'))
  @Get('/signin/google')
  async loginGoogle() {}

  @UseGuards(AuthGuard('google'))
  @Get('/callback/google')
  async googleCallback(@Req() req: any, @Res() res: any) {
    console.log('-------------', req.user);

    const user = await this.usersService.socialLogin(req, res);

    await this.authService.createTokens(res, user.id);
    const redirectUrl = user.isVerified
      ? 'http://localhost:4000'
      : 'http://localhost:4000/user/google';
    return res.redirect(redirectUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/additional-info')
  async create(
    @UserInfo() user: User,
    @Body() additionalInfoDto: AdditionalInfoDto,
  ) {
    const updatedUser = await this.usersService.updateAdditionalInfo(
      user.email,
      additionalInfoDto,
    );
    console.log(updatedUser);
    if (updatedUser) {
      return {
        statusCode: HttpStatus.OK,
        message: '가입되었습니다.',
        updatedUser,
      };
    }
  }

  /**
   * 네이버 로그인
   * @returns
   */
  @UseGuards(AuthGuard('naver'))
  @Get('/signin/naver')
  async signinNaver(@Req() req: any, @Res() res: any) {
    try {
      const user = await this.usersService.socialLogin(req, res);
      await this.authService.createTokens(res, user.id);

      return res.json({ message: '로그인이 완료되었습니다.' });
    } catch (err) {
      return { message: `${err}` };
    }
  }

  @UseGuards(AuthGuard('naver'))
  @Get('/callback/naver')
  async naverCallback(@Req() req: any, @Res() res: any) {
    res.redirect('/users');
  }

  /**
   * 카카오 로그인
   * @returns
   */
  @UseGuards(AuthGuard('kakao'))
  @Get('/signin/kakao')
  async signinKakao() {
    try {
      return;
    } catch (err) {
      return { message: `${err}` };
    }
  }

  @UseGuards(AuthGuard('kakao'))
  @Get('/callback/kakao')
  async kakaoCallback(@Req() req: any, @Res() res: any) {
    res.redirect('/users');
  }
}
