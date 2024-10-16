import { UserEntity } from '#api/users/entities/user.entity';
import { UsersService } from '#api/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

export interface JwtUser {
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  login({ username, pass }: { username: string; pass: string }) {
    return this.usersService.getUserWithPassword({ username }).then((user) => {
      if (!user)
        throw new UnauthorizedException(
          `no account found for the entry ${username}, register a new account`,
        );

      return bcrypt.compare(pass, user.pass).then((res) => {
        if (!res) throw new UnauthorizedException('wrong password');

        let { pass, ...result } = user;
        return {
          ...result,
          auth_token: this.sign(user),
        };
      });
    });
  }

  register(data: UserEntity) {
    return this.usersService.post(data).then((user: UserEntity) => ({
      ...user,
      auth_token: this.sign(user),
    }));
  }

  sign(user: UserEntity) {
    if (!user.id) throw new Error(`[Auth] user.id is empty!`);
    return this.jwtService.sign(<JwtUser>{ sub: user.id }, {
      // algorithm: 'RS256',
    });
  }
}
