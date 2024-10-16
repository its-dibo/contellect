import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudTypeOrmService } from '@engineers/nestjs-crud';
import { ContactEntity } from './entities/contact.entity';

@Injectable()
export class ContactsService extends CrudTypeOrmService<ContactEntity> {
  constructor(
    @InjectRepository(ContactEntity)
    protected repo: Repository<ContactEntity>,
  ) {
    super(repo);
  }

  /**
   * get a user including the hidden field `password`
   * the password field must be selected explicitly
   * @param where the condition
   * @returns
   */
  getUserWithPassword(where?: any) {
    return this.repo
      .createQueryBuilder('user')
      .addSelect('user.pass')
      .where(where)
      .getOne();
  }
}
