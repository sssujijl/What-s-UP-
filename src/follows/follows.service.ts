import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class FollowsService {
  constructor (
    @InjectRepository(Follow) private readonly followRepository: Repository<Follow>
  ) {}

  async follow(followerId: number, followeeId: number) {
    const follow = await this.findAll(followerId, followeeId);

    if (follow) {
      return await this.followRepository.delete({ followerId, followeeId });
    }

    return await this.followRepository.save({followerId, followeeId});
  }

  async findAll(followerId: number, followeeId: number) {
    const follow = await this.followRepository.findOneBy({followerId, followeeId});

    return follow;
  }

  async findFollower(userId: number) {
    const follower = await this.followRepository.findBy({ followerId: userId });

    if (!follower) {
      throw new NotFoundException('팔로우 목록을 찾을 수 없습니다.');
    }

    return follower;
  }

  async findFollowing(userId: number) {
    const following = await this.followRepository.findBy({ followeeId: userId });

    if (!following) {
      throw new NotFoundException('팔로잉 목록을 찾을 수 없습니다.');
    }

    return following;
  }
}
