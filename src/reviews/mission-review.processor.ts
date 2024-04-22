import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ReviewsService } from './reviews.service';

@Processor('mission-review')
export class MissionReviewProcessor {
  private readonly logger = new Logger(MissionReviewProcessor.name);

  constructor(private readonly reviewsService: ReviewsService) {}

  @Process('createMissionReview')
  async handleCreateMissionReview(job: Job) {
    this.logger.debug('Processing createMissionReview job', job.data);
    const { createReviewDto, userId, reservationId, place, mission } = job.data;
    try {
      return await this.reviewsService.createMissionReview(
        createReviewDto,
        userId,
        reservationId,
        place,
        mission,
      );
    } catch (error) {
      this.logger.error('Error processing createMissionReview job', error);
      throw error;
    }
  }
}
