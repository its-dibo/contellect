import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { IAppConfig } from '#configs/app';
import { ConfigService } from '@nestjs/config';
import { ISwaggerConfig } from '#configs/swagger';

function bootstrap() {
  return NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  ).then((app) => {
    let configService = app.get(ConfigService),
      appConfig = configService.get<IAppConfig>('app'),
      swaggerConfig = configService.get<ISwaggerConfig>('swagger');

    if (appConfig?.prefix) {
      app.setGlobalPrefix(appConfig.prefix, appConfig.prefixOptions);
    }

    app.enableVersioning(appConfig?.versioning);

    // todo: whitelist domains
    app.enableCors(appConfig?.corseOptions);

    // swagger docs
    // navigate to localhost:PORT to see API docs
    // navigate to localhost:PORT/-json to download the API json file
    if (swaggerConfig?.info) {
      let swaggerDocs = new DocumentBuilder()
        .setTitle(swaggerConfig.info.title)
        .setDescription(swaggerConfig.info.description || '')
        .setVersion(swaggerConfig.info.version)
        // todo: if(['bearer'].includes(swagger.auth))
        .addBearerAuth()
        .build();

      // todo: `.createDocument(app, {info: swaggerConfig, ...})
      let document = SwaggerModule.createDocument(app, swaggerDocs);
      SwaggerModule.setup('', app, document);
    }
    console.log(app.listen);
    return app
      .listen(3000)
      .then((server) => appConfig?.onServerRun?.(server, app))
      .catch((error) => console.log(error));
  });
}

bootstrap();
