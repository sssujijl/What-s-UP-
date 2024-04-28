import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
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
      const data = this.pointsService.findPoint(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '포인트를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 포인트 충전
   * @returns
   */
  @ApiBody({
    schema: {
      example: { amount: 1000 },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async updatePoint(
    @UserInfo() user: User,
    @Body() { amount }: { amount: number },
  ) {
    try {
      await this.pointsService.updatePoint(user.id, -amount);
      const pointNow = (await this.pointsService.findPoint(user.id)).point;
      if (pointNow) {
        return {
          statusCode: HttpStatus.OK,
          message: '성공적으로 충전되었습니다.',
          pointNow,
        };
      }
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
   * 포트원 결제 취소
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/kakao/cancel')
  async cancelPaymentPortOne(@Body() merchant_uid: string) {
    return this.pointsService.cancelPortOnePayment(merchant_uid);
  }
}
