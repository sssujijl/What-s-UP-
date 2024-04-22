import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PlaceListsService } from 'src/place-lists/place-lists.service';

@ApiTags('Recommend')
@Controller('recommend')
export class RecommendController {
  constructor(
    private readonly recommendService: RecommendService,
    private readonly placeListService: PlaceListsService,
  ) {}

  /**
   * 음식점 추천
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async recommendRestaurant(@Req() req: any): Promise<any> {
    const user = req.user;

    try {
      //SECTION - 유저가 방문했거나 저장한 음식점은 제외(우선 리뷰한 음식점 추가)
      const visitedOrSavedPlaces = await this.recommendService.reviewedPlaces(
        user.id,
      );

      //SECTION - 선호 카테고리 찾기
      const placeLists = await this.placeListService.findPlaceListsByUserId(
        user.id,
        user.nickName,
      );

      if (placeLists.length === 0) {
        throw new HttpException(
          '저장된 리스트가 없어 추천 기능을 이용할 수 없습니다. 마음에 드는 장소를 리스트에 저장해보세요!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const placesId = [];
      for (const placeList of placeLists) {
        const savedPlacesId = await this.placeListService.savedPlaces(
          placeList.id,
        );
        savedPlacesId.forEach((savedPlace) => {
          placesId.push(savedPlace);
          visitedOrSavedPlaces.push(savedPlace);
        });
      }

      const categories = [];
      for (const placeId of placesId) {
        const categoryId =
          await this.recommendService.getFoodCategoryId(placeId);
        categories.push(categoryId);
      }

      // const preferredCategories =
      //   await this.recommendService.getUserPreferredCategories(user.id);

      // const overlappingCategories = categories.filter((category) =>
      //   preferredCategories.includes(category),
      // );

      //SECTION - 유저 긍정 평가 리뷰 찾기
      const goodReviews = await this.recommendService.getSatisfiedReview(
        user.id,
      );

      if (placeLists.length === 0) {
        throw new HttpException(
          '추천을 위한 리뷰 데이터가 충분하지 않습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      //SECTION - 유저 취향과 가게 성향이 일치하는 곳 찾기
      const allReviewsText = goodReviews
        .map((review) => review.content)
        .join(' ');

      const userPreference =
        await this.recommendService.getPreference(allReviewsText);

      const places =
        await this.recommendService.getPlacesByFoodCategories(categories);

      const recommendedPlaces = this.recommendService.filterGoodPlaces(
        places.filter((place) => !visitedOrSavedPlaces.includes(place.id)),
        userPreference,
      );
      return recommendedPlaces;
    } catch (error) {
      console.error('음식점 추천 중 오류가 발생했습니다:', error);
      throw new HttpException(
        '음식점 추천 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
