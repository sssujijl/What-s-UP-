import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodCategory } from 'src/places/entities/foodCategorys.entity';
import { Place } from 'src/places/entities/place.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
import { Reservation } from 'src/reservations/entities/reservation.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Rating } from 'src/reviews/types/rating.types';
import { Repository } from 'typeorm';
import { In } from 'typeorm';

@Injectable()
export class RecommendService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(FoodCategory)
    private readonly foodCategoryRepository: Repository<FoodCategory>,
    @InjectRepository(ResStatus)
    private readonly resStatusRepository: Repository<ResStatus>,
  ) {}

  async getUserPreferredCategories(userId: number) {
    const reviews = await this.reviewRepository.find({
      where: { rating: In([Rating.Rating_4, Rating.Rating_5]) },
    });

    const userReservations = await Promise.all(
      reviews.map((review) => this.getReservationByReviewId(review.id, userId)),
    );

    const placeIds = userReservations.map(
      (reservation) => reservation.resStatus.placeId,
    );

    const preferredAllCategories = await Promise.all(
      placeIds.map((placeId) => this.getFoodCategoryId(placeId)),
    );

    const preferredCategories = [...new Set(preferredAllCategories)];

    return preferredCategories;
  }

  async getReservationByReviewId(reviewId: number, userId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) return null;

    const reservation = await this.reservationRepository.findOne({
      where: { id: review.reservationId, userId: userId },
      relations: ['resStatus'],
    });
    return reservation;
  }

  async getFoodCategoryId(placeId: number) {
    const place = await this.placeRepository.findOne({
      where: { id: placeId },
    });
    return place ? place.foodCategoryId : null;
  }

  async getFoodCategory(foodCategoryId: number) {
    const foodCategory = await this.foodCategoryRepository.findOne({
      where: { id: foodCategoryId },
    });
    return foodCategory ? [foodCategory.category] : [];
  }

  async getPlacesByFoodCategories(foodCategoryIds: number[]) {
    const places = await this.placeRepository.find({
      where: { foodCategoryId: In(foodCategoryIds) },
    });

    return places;
  }

  async filterGoodPlaces(places: Place[]) {
    const goodPlaces = await Promise.all(
      places.map(async (place) => {
        const resStatusList = await this.resStatusRepository.find({
          where: { placeId: place.id },
        });
        if (!resStatusList || resStatusList.length === 0) return null;

        const reservations = await Promise.all(
          resStatusList.map((resStatus) =>
            this.reservationRepository.findOne({
              where: { resStatusId: resStatus.id },
            }),
          ),
        );
        if (!reservations || resStatusList.length === 0) return null;

        const goodReviews = await Promise.all(
          reservations.map((reservation) =>
            this.reviewRepository.find({
              where: {
                reservationId: reservation.id,
                rating: In([Rating.Rating_4, Rating.Rating_5]),
              },
            }),
          ),
        );
        // console.log(goodReviews);
        const reviews = await Promise.all(
          reservations.map((reservation) =>
            this.reviewRepository.find({
              where: { reservationId: reservation.id },
            }),
          ),
        );
        // console.log(reviews);
        const goodRate = goodReviews.length / reviews.length;

        console.log(
          '좋은 리뷰:',
          goodReviews.length,
          '전체 리뷰:',
          reviews.length,
        );
        console.log('좋은 리뷰 비율:', goodRate);

        return goodRate > 0.6 ? place : null;
      }),
    );

    return goodPlaces.filter((place) => place !== null);
  }
}
