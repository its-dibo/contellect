import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // deny expired JWT
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('keys.privateKey') ||
        configService.get<string>('keys.publicKey'),
    });
  }

  validate(payload: any) {
    return payload;
  }
}
