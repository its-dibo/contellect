import { Body, Controller, Get, Patch, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { User } from '#decorators/user.decorator';
import { Private, Public } from '#api/auth/guards/auth.guard';
import { Crud } from '@engineers/nestjs-crud';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
// the password field already removed by the schema
@Crud({ model: UserEntity })
export class UsersController {
  constructor(private readonly service: UsersService) {}

  /**
   * get the current loggedIn user
   */
  @Get('me')
  @ApiOkResponse({ type: UserEntity })
  me(@User('sub') userId: string) {
    return this.service.getOne(userId);
  }
}
