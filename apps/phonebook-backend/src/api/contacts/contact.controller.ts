import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@engineers/nestjs-crud';
import { ContactEntity } from './entities/contact.entity';
import { ContactsService } from './contact.service';

@Controller('contacts')
@ApiTags('contacts')
@ApiBearerAuth()
@Crud((opts) => ({ ...opts, model: ContactEntity, maxLimit: 5 }))
export class ContactsController {
  constructor(private readonly service: ContactsService) {}
}
