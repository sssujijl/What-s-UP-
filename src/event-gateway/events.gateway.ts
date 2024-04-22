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
import { onlineMap } from './onlineMap';
import { ChatRoom } from 'src/chat-rooms/entites/chat-room.entity';
import { User_ChatRoom } from 'src/chat-rooms/entites/user-chatRoom.entity';
import { User } from 'src/users/entities/user.entity';

@WebSocketGateway(8080, {cors: { origin: '*'}})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
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
  
  @SubscribeMessage('userLeft')
  handleUserLeft(socket: Socket) {
    socket.on('userLeft', (data) => {
      console.log(`${data.chatRoomId} 채팅방을 ${data.user} 님이 나가셨습니다.`);
    });
  }

  @SubscribeMessage('message')
  handleMessage(socket: Socket, data: any) {
    console.log(socket);
    console.log(data);
  }

  afterInit(server: Server) {
    console.log('websocketServer init');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    console.log('conntected', socket.handshake.auth)

    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }

    socket.emit('hello', socket.nsp.name);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnected', socket.nsp.name);

    const newNamespace = socket.nsp;
    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
  }
}

// 1. 유저랑 연결
// 2. 리액트랑 연결
// 3. 주고받은 메세지 저장
// 4. 유저 Id저장
// 5. 룸 설정?
