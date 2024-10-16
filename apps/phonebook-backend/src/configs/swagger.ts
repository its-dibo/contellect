import { registerAs } from '@nestjs/config';
import { OpenAPIObject } from '@nestjs/swagger';

export type ISwaggerConfig = Omit<OpenAPIObject, 'paths'>;

// or `<InfoObject>`
export default registerAs<ISwaggerConfig>('swagger', () => ({
  openapi: '',
  info: {
    title: 'Contellect',
    description: 'Contellect API documentations',
    version: '1.0',
  },
}));
