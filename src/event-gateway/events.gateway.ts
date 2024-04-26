import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { RedisService } from 'nestjs-redis';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8080)
export class EventsGateway {
    @WebSocketServer()
    server!: Server;

    // constructor(private readonly redisService: RedisService) {}

    async handleConnection(client: Socket): Promise<void> {
        const socketId = client.id;
        console.log(socketId)
        this.server.emit('성진', '안녕');
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