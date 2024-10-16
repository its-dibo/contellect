import { VersioningType } from '@nestjs/common';
import {
  GlobalPrefixOptions,
  VersioningOptions,
} from '@nestjs/common/interfaces';
import {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import { registerAs } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFastifyApplication } from '@nestjs/platform-fastify/interfaces';
import { RawServerDefault } from 'fastify';
import { AddressInfo } from 'node:net';

export interface IAppConfig {
  port?: string | number;
  /** the baseurl of the client app. used to generate links in emails and newsletters */
  url?: string;
  /** the global prefix for every HTTP route path. see Nest.setGlobalPrefix() */
  prefix?: string;
  prefixOptions?: GlobalPrefixOptions;
  versioning?: VersioningOptions;
  corseOptions?: CorsOptions | CorsOptionsDelegate<any>;
  /** a hook that executed when the server runs and listens to the specified port */
  onServerRun?: (
    server: RawServerDefault,
    app: NestFastifyApplication | NestExpressApplication,
  ) => void;
  onServerError?: (
    error: Error,
    app: NestFastifyApplication | NestExpressApplication,
  ) => void;
}

export default registerAs<IAppConfig>('app', () => ({
  port: process.env.PORT || 3000,
  url: process.env.APP_URL,
  prefix: 'api',
  prefixOptions: {
    exclude: ['sitemap.xml', 'robots.txt'],
  },
  versioning: {
    defaultVersion: ['1.0'],
    type: VersioningType.URI,
  },
  onServerRun: (server, app) => {
    let { address, port } = <AddressInfo>server.address();

    console.info(`running at ${address}:${port}`);
    console.info(`Env: ${process.env.ENV}`);
    console.info(`database: ${process.env.DB_HOST}`);
    if (process.env.NODE_ENV !== process.env.ENV) {
      console.error(
        `[ERROR] NODE_ENV is ${process.env.NODE_ENV}, but a .env file for ${process.env.ENV || '--'} is loaded`,
      );
    }
  },
  onServerError: (app, error) => {
    // todo: send the error to the logger
    console.error(`Server failed to run`);
    throw error;
  },
}));
