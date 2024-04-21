import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import dotenv from 'dotenv' 
import { IoAdapter } from '@nestjs/platform-socket.io'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe())
  app.useWebSocketAdapter(new IoAdapter(app));

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
