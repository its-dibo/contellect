import { CrudFactory } from '#crud.factory';
import { EmptyDto } from '#dto/empty.dto';
import { addDecorators } from '#helpers/decorators';
import { HttpMethod, Route } from '#types/crud.types';
import { ApiBody } from '@nestjs/swagger';

export function addSwaggerBody(route: Route, factory: CrudFactory) {
  if (
    !Reflect.hasMetadata(
      'swagger/apiResponse',
      factory.controller.prototype,
      route.methodName,
    )
  ) {
    // todo: create DTO variations for each http method
    // for example make all fields optional for PATCH
    // todo: add ValidationPipe groups for each http method
    // eslint-disable-next-line unicorn/no-lonely-if
    if ((<HttpMethod[]>['POST', 'PATCH', 'PUT']).includes(route.httpMethod)) {
      addDecorators(
        route,
        ApiBody({
          type:
            route.model === null
              ? EmptyDto
              : route.model || factory.options?.model,
        }),
      );
    }
  }
}
