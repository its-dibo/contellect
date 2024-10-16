import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from '#api/auth/auth.module';
import { ContactsModule } from '#api/contacts/contact.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '#api/auth/guards/auth.guard';
import databaseConfig from '#configs/database';
import { ScheduleModule } from '@nestjs/schedule';
import SwaggerConfig from '#configs/swagger';
import appConfig from '#configs/app';
import { UsersModule } from '#api/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(<TypeOrmModuleOptions>{
      ...databaseConfig(),
      entities: [],
      // todo: this should be disabled in prod to prevent the db data from being lost
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    UsersModule,
    ContactsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      // load config files that are used in main.ts, i.e. before fully loading ConfigService by DI system
      load: [SwaggerConfig, appConfig],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
