import { IsNumber, IsString } from 'class-validator';

export class TossCancelDto {
  /**
   * 취소 사유
   * @example "단순 변심"
   */
  @IsString()
  cancelReason: string;
  /**
   * 취소 금액
   * @example 15000
   */
  @IsNumber()
  cancelAmount: number;
}
