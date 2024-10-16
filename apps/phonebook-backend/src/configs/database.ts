import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export default registerAs(
  'database',
  () =>
    <DataSourceOptions>{
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST || 'localhost',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE ,
      port: process.env.DB_PORT,
    },
);
