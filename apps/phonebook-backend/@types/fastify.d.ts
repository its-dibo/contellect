import { JwtUser } from '#api/auth/auth.service';
import { Roles } from '#api/contacts/entities/user.entity';
import fastify from 'fastify';

declare module 'fastify' {
  export interface FastifyRequest {
    user: JwtUser;
  }
}
