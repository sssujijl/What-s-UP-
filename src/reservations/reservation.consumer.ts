import { OnQueueCompleted, OnQueueError, OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { ReservationsService } from "./reservations.service";
import { Job } from "bull";

@Processor('reservationQueue')
export class ReservationConsumer {
    constructor(
        private readonly reservationService: ReservationsService
    ) {}

    @Process('reservation')
    async getReservationQueue(job: Job) {
        const reservation = await this.reservationService.createReservation(
            job.data.resStatusId,
            job.data.createReservationDto
        );

        if ('message' in reservation) {
            throw new Error(reservation.message);
        }
    }

    @OnQueueCompleted()
    async A () {
        console.log('------성공');
    }

    @OnQueueFailed()
    failHandler(job: Job, err: Error) {
      console.log('OnQueueFailed');
      throw err;
    }
  
    @OnQueueError()
    errorHandler(err: Error) {
      console.log('OnQueueError');
      throw err;
    }
}