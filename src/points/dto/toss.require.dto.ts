import { IsString, IsNumber } from 'class-validator';

export class TossPaymentDto {
  /**
   * paymentKey
   * @example "tviva20240423093434Bwlk0"
   */
  @IsString()
  paymentKey: string;
  /**
   * orderId
   * @example "MC4yNzAwODk0MzIyODgw"
   */
  @IsString()
  orderId: string;

  /**
   * orderId
   * @example 15000
   */
  @IsNumber()
  amount: number;
}
