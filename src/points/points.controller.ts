import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { ApiTags } from '@nestjs/swagger';
import { TossPaymentDto } from './dto/toss.require.dto';

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
    @Req() req: any,
    @Body() tossPaymentDto: TossPaymentDto,
  ) {
    const userId = req.user.id;
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
   * @param cancelReason
   * @param cancelAmount
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/toss/:paymentKey/cancel')
  async cancelPaymentToss(
    @Req() req: any,
    @Param('paymentKey') paymentKey: string,
    @Body('cancelReason') cancelReason: string,
    @Body('cancelAmount') cancelAmount?: number,
  ) {
    const userId = req.user.id;
    return this.pointsService.cancelPayment(
      userId,
      paymentKey,
      cancelReason,
      cancelAmount,
    );
  }
}
