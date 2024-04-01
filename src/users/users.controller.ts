import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { validate } from 'class-validator';
import { SignupDto } from './dto/signup.dto';
import { signinDto } from './dto/signin.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from './entities/user.entity';
import { EditUserDto } from './dto/editUser.dto';
import { DeleteUserDto } from './dto/deleteUser.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('USER')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @ApiOperation({ summary: "회원가입 API" })
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    try {
      await validate(signupDto);

      return await this.usersService.signup(signupDto);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @ApiOperation({ summary: "로그인 API " })
  @Post('signin')
  async signin(
    @Body() signinDto: signinDto,
    @Res() res: any
  ) {
    try {
      await validate(signinDto);

      const user = await this.usersService.signin(signinDto);

      await this.authService.createTokens(res, user.id);

      return res.json({ message: "로그인이 완료되었습니다." });
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @ApiOperation({ summary: "내정보조회 API " })
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard("jwt"))
  @Get()
  async getUser(@UserInfo() user: User) {
    try {
      return { user };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @ApiOperation({ summary: "내정보 수정 API " })
  @ApiBearerAuth("access-token")
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

  @ApiOperation({ summary: "회원탈퇴 API " })
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard("jwt"))
  @Delete()
  async deleteUser(
    @UserInfo() user: User,
    @Body() deleteUserDto: DeleteUserDto,
    @Res() res: any
  ) {
    try {
      await this.usersService.deleteUser(user, deleteUserDto);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return { message: `${user.name} 님이 정상적으로 탈퇴되었습니다.`};
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
