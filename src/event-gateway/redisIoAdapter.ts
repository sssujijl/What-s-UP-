import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: any;

  constructor(private readonly pubClient: any, private readonly subClient: any) {
    super();
    this.adapterConstructor = createAdapter( pubClient, subClient );
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

const redisIoAdapter = new RedisIoAdapter(pubClient, subClient);