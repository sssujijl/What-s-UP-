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

@WebSocketGateway(8080, {cors: { origin: '*'}})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() public server: Server;

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
