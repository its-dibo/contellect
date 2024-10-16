import { CrudFactory } from '#crud.factory';
import { addDecorators } from '#helpers/decorators';
import { Route } from '#types/crud.types';
import { ApiOperation } from '@nestjs/swagger';

/**
 * add Swagger's \@ApiOperation()
 * @param route
 */
export function addSwaggerOperation(route: Route, factory: CrudFactory) {
  if (
    Reflect.hasMetadata(
      'swagger/apiOperation',
      factory.controller.prototype,
      route.methodName,
    )
  )
    return;

  // remove "path" or add "prefix" metadata to it from the constructor
  // to prevent displaying the path without the controller prefix in Swagger docs
  let { path, ...operation } = route;
  addDecorators(route, ApiOperation(operation));
}
