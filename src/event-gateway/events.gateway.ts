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
import { RedisService } from 'nestjs-redis';
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

  @SubscribeMessage('login')
  handleLogin(socket: Socket) {
    socket.on('login', async (data) => {
      console.log(data);
    })
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

      const publish = {
        userId: user.id,
        user: {
          nickName: user.nickName,
        },
        content: data.message,
        createdAt: new Date(socket.handshake.time).toISOString()
      }

      this.server.emit(`message: ${data.chatRoomId}`, publish);

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
