import { IsString, IsNumber } from 'class-validator';

export class TossPaymentDto {
  @IsString()
  paymentKey: string;

  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;
}
