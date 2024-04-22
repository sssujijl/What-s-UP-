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
import { ReservationsService } from 'src/reservations/reservations.service';

@ApiTags('Recommend')
@Controller('recommend')
export class RecommendController {
  constructor(
    private readonly recommendService: RecommendService,
    private readonly placeListService: PlaceListsService,
    private readonly reservationService: ReservationsService,
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
      //SECTION - 선호 카테고리 찾기
      const placeLists = await this.placeListService.findPlaceListsByUserId(
        user.id,
        user.nickName,
      );

      const placesId = [];
      for (const placeList of placeLists) {
        const savedPlacesId = await this.placeListService.savedPlaces(
          placeList.id,
        );
        savedPlacesId.forEach((savedPlace) => {
          placesId.push(savedPlace);
        });
      }

      const categories = [];
      for (const placeId of placesId) {
        const categoryId =
          await this.recommendService.getFoodCategoryId(placeId);
        categories.push(categoryId);
      }

      const preferredCategories =
        await this.recommendService.getUserPreferredCategories(user.id);

      const overlappingCategories = categories.filter((category) =>
        preferredCategories.includes(category),
      );

      //SECTION - 유저 긍정 평가 리뷰 찾기
      const reservations =
        await this.reservationService.findReservationsByUserId(user.id);
      const reservationsId = reservations.map((reservation) => reservation.id);
      const goodReviews = [];
      for (const reservationId of reservationsId) {
        const goodReview =
          await this.recommendService.getSatisfiedReview(reservationId);
        if (goodReview) {
          goodReviews.push(goodReview);
        }
      }

      //SECTION - 유저 취향과 가게 성향이 일치하는 곳 찾기
      const allReviewsText = goodReviews
        .map((review) => review.content)
        .join(' ');

      const userPreference =
        await this.recommendService.getPreference(allReviewsText);

      const places = await this.recommendService.getPlacesByFoodCategories(
        overlappingCategories,
      );

      const recommendedPlaces = this.recommendService.filterGoodPlaces(
        places,
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
