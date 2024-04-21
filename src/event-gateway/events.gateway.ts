import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8080)
export class EventsGateway {
    @WebSocketServer()
    server!: Server;

    async handleConnection(client: Socket): Promise<void> {
        const socketId = client.id;
        console.log(socketId)
        this.server.emit('성진', 'data');
    } 
      
    @SubscribeMessage('민석') 
    async handleMessage(@MessageBody() data: any): Promise<void> {
        console.log(data);
        this.server.emit('성진', data);
    }
}

// 1. 유저랑 연결
// 2. 리액트랑 연결
// 3. 주고받은 메세지 저장
// 4. 유저 Id저장
// 5. 룸 설정?