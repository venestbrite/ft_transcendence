import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as session from 'express-session';
import * as passport from 'passport'
// somewhere in your initialization file

import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file

import * as expressSanitizer from 'express-sanitizer'

import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from "@nestjs/config";

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';




async function bootstrap() {
 // const app = await NestFactory.create(AppModule);
  const fs = require('fs');

  const keyFile  = fs.readFileSync('../app/key.pem');
  const certFile = fs.readFileSync('../app/cert.pem');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: {
      key: keyFile,
      cert: certFile,
    }
 });
  app.use(
    session({
      cookie: {
        maxAge: 60000 * 60 * 24 // 1 m per 60m * 24 h
      },
      secret: 'my-secret', // cookie encryption 
      resave: false,
      saveUninitialized: false, // save sessions only if user is logged in 
    }),
  ); 
  const service = new ConfigService();
  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());
  app.use(expressSanitizer());

  const origin_url = service.get<any>("CORS_URL");

  app.enableCors({
    credentials: true, origin: origin_url
  });

  // app.enableCors({
  //   credentials:true, origin: true
  // })

  app.useStaticAssets(join(__dirname, '..', 'avatars'));

  await app.listen(5050);
}
bootstrap();
