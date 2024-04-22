import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRoom } from 'src/chat-rooms/entites/chat-room.entity';
import { User_ChatRoom } from 'src/chat-rooms/entites/user-chatRoom.entity';
import { User } from 'src/users/entities/user.entity';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway(8080, {cors: { origin: '*'}})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly authService: AuthService
  ) {}

  @WebSocketServer() public server: Server;

  async createRoomJoin(chatRoom: ChatRoom, pub: User, sub: User) {
    this.server.emit('newRoom', chatRoom);
    this.server.emit('userJoined', { chatRoomId: chatRoom.id, user: pub.nickName });
    this.server.emit('userJoined', { chatRoomId: chatRoom.id, user: sub.nickName });
  }

  @SubscribeMessage('newRoom')
  handleNewRoom(socket: Socket) {
    socket.on('newRoom', (data) => {
      console.log(`${data.chatRoomId} 채팅방이 생성되었습니다.`);
    });
  }

  @SubscribeMessage('userJoined')
  handleUserJoined(socket: Socket) {
    socket.on('userJoined', (data) => {
      console.log(`${data.chatRoomId} 채팅방에 ${data.user} 님이 참가하였습니다.`);
    });
  }

  async leaveChatRoom(userChatRoom: User_ChatRoom) {
    this.server.emit('userLeft', userChatRoom);
  }

  async unsubscribeFromChannel(userId: number, chatRoomId: number) {
  }
  
  @SubscribeMessage('userLeft')
  handleUserLeft(socket: Socket) {
    socket.on('userLeft', (data) => {
      console.log(`${data.chatRoomId} 채팅방을 ${data.user} 님이 나가셨습니다.`);
    });
  }

  @SubscribeMessage('message')
  async handleMessage(
    socket: Socket, 
    data: any,
  ): Promise<void> {
    try {
      const auth = socket.handshake.auth.token
      const user = await this.authService.validateToken(auth);
      this.server.emit('send', data);
      
      const publish = {
        userId: user.id,
        nickName: user.nickName,
        message: data.message,
        currentTime: new Date().toISOString()
      }
      this.server.to(data.chatRoomId).emit('message', publish);
      await this.publishMessage(data.chatRoomId, publish);
    } catch (error) {
      console.error('메시지 처리 중 오류 발생:', error);
    }
  }

  async publishMessage(chatRoomId: number, publish: any) {
    const roomKey = `ChatRoom:${chatRoomId}`;
    
    await this.redisClient.rpush(roomKey, JSON.stringify(publish));
  }
  
  afterInit(server: Server) {
    console.log('websocketServer init');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    console.log('conntected')
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnected');
  }
}

// 1. 유저랑 연결
// 2. 리액트랑 연결
// 3. 주고받은 메세지 저장
// 4. 유저 Id저장
// 5. 룸 설정?
