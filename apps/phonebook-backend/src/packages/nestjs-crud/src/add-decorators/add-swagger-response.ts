import { CrudFactory } from '#crud.factory';
import { addDecorators } from '#helpers/decorators';
import { Route } from '#types/crud.types';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function addSwaggerResponse(route: Route, factory: CrudFactory) {
  if (
    !Reflect.hasMetadata(
      'swagger/apiResponse',
      factory.controller.prototype,
      route.methodName,
    )
  ) {
    let dto = route.responseModel || route.model || factory.options?.model;

    // todo: add other status responses
    // add options.responseModels[status]
    addDecorators(
      route,
      ApiResponse({ status: HttpStatus.OK, type: route.many ? [dto] : dto }),
      ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        type: route.errorResponseModel || factory.options?.errorResponseModel,
      }),
      ...[
        ...(factory.options?.responseModels || []),
        ...(route.responseModels || []),
      ].map((model) => ApiResponse(model)),
    );
  }
}
