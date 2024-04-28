import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { Redis } from 'ioredis';
import { RedisModule } from 'nestjs-redis';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        RedisModule,
        AuthModule,
        UsersModule 
    ],
    providers: [
        EventsGateway,
    ],
    exports: [EventsGateway]
})
export class EventGatewayModule {}
