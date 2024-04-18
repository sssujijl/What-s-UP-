import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Recommend')
@Controller('recommend')
export class RecommendController {
  constructor(private readonly recommendService: RecommendService) {}

  /**
   * 음식점 추천
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async recommendRestaurant(@Req() req: any): Promise<any> {
    const userId = req.user.id;

    const preferredCategories =
      await this.recommendService.getUserPreferredCategories(userId);

    console.log('좋아하네요:', preferredCategories);

    const places =
      await this.recommendService.getPlacesByFoodCategories(
        preferredCategories,
      );

    console.log('이런 곳들 있어요:', places);

    const recommendedPlaces = this.recommendService.filterGoodPlaces(places);
    return recommendedPlaces;
  }
}
