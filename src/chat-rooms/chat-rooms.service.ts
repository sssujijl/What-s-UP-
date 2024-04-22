import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatRoom } from './entites/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly roomRepository: Repository<ChatRoom>,
  ) {}

//   getRooms(getRoomsDto: GetRoomsDto) {
//     return this.roomRepository.find({
//       skip: getRoomsDto.skip,
//       take: getRoomsDto.take,
//       order: { createdAt: 'DESC' },
//     });
//   }

//   getRoom(id: number) {
//     return this.roomRepository.findOneBy({ id });
//   }

//   async searchRooms(searchRoomsDto: SearchRoomsDto) {
//     const qb = this.roomRepository.createQueryBuilder('rooms');
//     if (searchRoomsDto.skip) {
//       qb.skip(searchRoomsDto.skip);
//     }
//     if (searchRoomsDto.take) {
//       qb.take(searchRoomsDto.take);
//     }
//     if (searchRoomsDto.title) {
//       qb.andWhere('rooms.title ILIKE :title', {
//         title: `%${searchRoomsDto.title}%`,
//       });
//     }
//     if (searchRoomsDto.ownerId) {
//       qb.andWhere('rooms.ownerId = :ownerId', {
//         ownerId: searchRoomsDto.ownerId,
//       });
//     }
//     const [items, count] = await qb.getManyAndCount();
//     return { items, count };
//   }

//   async createRoom(createRoomDto: CreateRoomDto, userId: number) {
//     const room = this.roomRepository.create({
//       title: createRoomDto.title,
//       description: createRoomDto.description,
//       owner: { id: userId },
//     });
//     await this.roomRepository.save(room);
//   }

//   async updateRoom(id: number, updateRoomDto: UpdateRoomDto, userId: number) {
//     const result = await this.roomRepository.update(
//       { id, owner: { id: userId } },
//       updateRoomDto,
//     );
//     if (result.affected === 0) {
//       throw new NotFoundException(`Room with id ${id} not found`);
//     }
//   }

//   async deleteRoom(id: number, userId: number) {
//     const result = await this.roomRepository.delete({
//       id,
//       owner: { id: userId },
//     });
//     if (result.affected === 0) {
//       throw new NotFoundException(`Room with id ${id} not found`);
//     }
//   }
}
