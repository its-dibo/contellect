import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactEntity } from './entities/contact.entity';
import { ContactsController } from './contact.controller';
import { ContactsService } from './contact.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContactEntity])],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
