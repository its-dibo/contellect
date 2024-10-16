import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport-strategies/local.strategy';
import { JwtStrategy } from './passport-strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import keysConfig from '#configs/keys';
import { UsersModule } from '#api/users/users.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      // todo: configs.jwt.expiresIn
      // todo: set expire to '1h' after implementing refreshToken
      signOptions: { expiresIn: '90d', algorithm: 'RS256' },
      // todo: use ConfigService
      secret: process.env.privateKey || process.env.publicKey,
    }),
    ConfigModule.forFeature(keysConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
