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

    const prefferedCategories =
      await this.recommendService.getUserPreferredCategories(userId);

    const places =
      await this.recommendService.getPlacesByFoodCategories(
        prefferedCategories,
      );

    const recommendedPlaces = this.recommendService.filterGoodPlaces(places);
    return recommendedPlaces;
  }
}
