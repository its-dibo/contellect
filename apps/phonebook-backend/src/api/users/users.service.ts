import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { Obj } from '#types';
import { CrudTypeOrmService } from '@engineers/nestjs-crud';

@Injectable()
export class UsersService extends CrudTypeOrmService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    protected repo: Repository<UserEntity>,
  ) {
    super(repo);
  }

  post(body: UserEntity, query?: any, req?: Request) {
    return bcrypt
      .hash(body.pass, 10)
      .then((pass) =>
        super.post({ ...body, ...(pass ? { pass } : {}) }, query, req),
      );
  }

  patchOne(body: UserEntity, id: string | number | Obj, req?: Request) {
    return (body.pass ? bcrypt.hash(body.pass, 10) : Promise.resolve()).then(
      (pass) => super.patchOne({ ...body, ...(pass ? { pass } : {}) }, id, req),
    );
  }

  patchMany(body: UserEntity, query?: any, req?: Request) {
    return (body.pass ? bcrypt.hash(body.pass, 10) : Promise.resolve())
      .then((pass) => <UserEntity>{ ...body, pass })
      .then((body) => super.patchMany(body, query, req));
  }

  /**
   * get a user including the hidden field `password`
   * the password field must be selected explicitly
   * @param where the condition
   * @returns
   */
  // todo: add type for `where`
  getUserWithPassword(where?: any) {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.pass')
      .where(where)
      .getOne();
  }
}
