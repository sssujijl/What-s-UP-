import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { ApiTags } from '@nestjs/swagger';
import { TossPaymentDto } from './dto/toss.require.dto';
import { TossCancelDto } from './dto/toss.cancel.dto';

@ApiTags('Points')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * 포인트 조회
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findPoint(@UserInfo() user: User) {
    try {
      await this.pointsService.findPoint(user.id);
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 토스 결제 승인
   * @param tossPaymentDto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/toss')
  async requestPaymentToss(
    @Body() tossPaymentDto: TossPaymentDto,
    @UserInfo() user: User,
  ) {
    const userId = user.id;
    return this.pointsService.requestPaymentToss(tossPaymentDto, userId);
  }

  /**
   * 토스 결제 조회
   * @param paymentKey
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('/toss/:paymentKey')
  async findPaymentToss(@Param('paymentKey') paymentKey: string) {
    return this.pointsService.findPaymentToss(paymentKey);
  }

  /**
   * 토스 결제 취소
   * @param paymentKey
   * @param tossCancelDto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/toss/:paymentKey/cancel')
  async cancelPaymentToss(
    @Req() req: any,
    @Param('paymentKey') paymentKey: string,
    @Body() tossCancelDto: TossCancelDto,
  ) {
    const userId = req.user.id;
    const { cancelReason, cancelAmount } = tossCancelDto;
    return this.pointsService.cancelPayment(
      userId,
      paymentKey,
      cancelReason,
      cancelAmount,
    );
  }

  /**
   * 카카오페이 결제 준비
   * @param
   * @returns
   */
  @Post('/kakaopay/ready')
  async readyPayment(@Body() data: any) {
    try {
      const response = await this.pointsService.readyPayment(data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 카카오페이 결제 진행
   * @param
   * @returns
   */
  @Post('/kakaopay/approve')
  async approvePayment(@Body() data: any) {
    try {
      const response = await this.pointsService.approvePayment(data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
