import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
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

  async reviewedPlaces(userId: number) {
    const reviews = await this.reviewRepository.find({
      where: { userId },
      select: ['placeId'],
    });

    return reviews.map((review) => review.placeId);
  }

  async getSatisfiedReview(userId: number) {
    const reviews = await this.reviewRepository.find({
      where: { rating: In([Rating.Rating_4, Rating.Rating_5]), userId },
    });
    return reviews;
  }

  // async getUserPreferredCategories(userId: number) {
  //   const reviews = await this.reviewRepository.find({
  //     where: { rating: In([Rating.Rating_4, Rating.Rating_5]) },
  //   });

  //   const userReservations = await Promise.all(
  //     reviews.map((review) => this.getReservationByReviewId(review.id, userId)),
  //   );

  //   const placeIds = userReservations.map(
  //     (reservation) => reservation.resStatus.placeId,
  //   );

  //   const preferredAllCategories = await Promise.all(
  //     placeIds.map((placeId) => this.getFoodCategoryId(placeId)),
  //   );

  //   const preferredCategories = [...new Set(preferredAllCategories)];

  //   return preferredCategories;
  // }

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

  async analyzeSentiment(review: string) {
    const url =
      'https://naveropenapi.apigw.ntruss.com/sentiment-analysis/v1/analyze';
    const headers = {
      'X-NCP-APIGW-API-KEY-ID': process.env.SENTIMENT_CLIENT_ID,
      'X-NCP-APIGW-API-KEY': process.env.SENTIMENT_CLIENT_SECRET,
      'Content-Type': 'application/json',
    };
    const data = { content: review };

    try {
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error) {
      throw new Error(`감정 분석 실패: ${error.message}`);
    }
  }

  async filterGoodPlaces(places: Place[], userPreference: string) {
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

        const allReviewsText = goodReviews
          .flat()
          .map((review) => review.content)
          .join(' ');

        const placeType = await this.getPreference(allReviewsText);

        return placeType === userPreference ? place : null;
      }),
    );

    return goodPlaces.filter((place) => place !== null);
  }

  async getPreference(allReviewsText: string): Promise<string> {
    const reviewAnalysis = await this.analyzeSentiment(allReviewsText);

    const positiveSentences = reviewAnalysis.sentences.filter(
      (sentence) => sentence.sentiment === 'positive',
    );

    let serviceCount = 0;
    let atmosphereCount = 0;
    let tasteCount = 0;
    let priceCount = 0;

    const keywords = {
      맛: ['맛', '신선'],
      가격: ['가격', '가성비', '저렴'],
      분위기: ['분위기', '인테리어', '편안'],
      서비스: ['서비스', '응대', '친절', '매너'],
    };

    for (const sentence of positiveSentences) {
      for (const highlight of sentence.highlights) {
        const highlightedContent = sentence.content.substring(
          highlight.offset,
          highlight.offset + highlight.length,
        );
        console.log('하이라이트:', highlightedContent);
        for (const category in keywords) {
          if (
            keywords[category].some((keyword) =>
              highlightedContent.includes(keyword),
            )
          ) {
            switch (category) {
              case '맛':
                tasteCount++;
                break;
              case '가격':
                priceCount++;
                break;
              case '분위기':
                atmosphereCount++;
                break;
              case '서비스':
                serviceCount++;
                break;
              default:
                break;
            }
          }
        }
      }
    }

    const preferenceThreshold = 0.1; // 오차범위

    const total = tasteCount + priceCount + atmosphereCount + serviceCount;

    const tasteRatio = tasteCount / total;
    const priceRatio = priceCount / total;
    const atmosphereRatio = atmosphereCount / total;
    const serviceRatio = serviceCount / total;

    const maxRatio = Math.max(
      tasteRatio,
      priceRatio,
      atmosphereRatio,
      serviceRatio,
    );

    let preference = '';
    if (
      Math.abs(tasteRatio - maxRatio) < preferenceThreshold &&
      Math.abs(priceRatio - maxRatio) < preferenceThreshold &&
      Math.abs(atmosphereRatio - maxRatio) < preferenceThreshold &&
      Math.abs(serviceRatio - maxRatio) < preferenceThreshold
    ) {
      preference = 'neutral';
    } else if (maxRatio === tasteRatio) {
      preference = 'taste';
    } else if (maxRatio === priceRatio) {
      preference = 'price';
    } else if (maxRatio === atmosphereRatio) {
      preference = 'atmosphere';
    } else {
      preference = 'service';
    }

    console.log('분석된 타입:', preference);
    return preference;
  }
}
