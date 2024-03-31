import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { validate } from 'class-validator';
import { SignupDto } from './dto/signup.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async signup(@Body() signupDto: SignupDto) {
    try {
      await validate(signupDto);

      return await this.usersService.signup(signupDto);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
