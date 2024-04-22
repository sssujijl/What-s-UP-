import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import dotenv from 'dotenv' 
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { createClient } from "redis";
import { RedisIoAdapter } from "./event-gateway/redisIoAdapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();

  const corsOptions: CorsOptions = {
    origin: 'http://localhost:4000',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };
  app.enableCors(corsOptions);
  
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe())

  const pubClient = createClient({ url: 'redis://localhost:6379' });
  const subClient = createClient({ url: 'redis://localhost:6379' });
  const redisIoAdapter = new RedisIoAdapter(pubClient, subClient);

  app.useWebSocketAdapter(redisIoAdapter);


  const config = new DocumentBuilder()
    .setTitle('Whats_UP')
    .setDescription('whats UP API description')
    .setVersion('1.0')
    .addTag('Whats_UP')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        name: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}
bootstrap();
