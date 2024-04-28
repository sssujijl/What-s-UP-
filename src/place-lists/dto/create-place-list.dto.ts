import { PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { PlaceList } from "../entities/place-list.entity";

export class CreatePlaceListDto extends PickType(PlaceList, [
    'userId',
    'title',
    'content',
    'visible'
]) {
    /**
   * 장소 리스트 이름
   * @example "내가 가고싶은 맛집"
   */
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  readonly title: string;

  /**
   * 내용
   * @example "카츠혼또, 피제이피자"
   */
  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  readonly content: string;
}
