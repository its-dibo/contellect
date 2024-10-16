import { CrudFactory } from '#crud.factory';
import { addDecorators } from '#helpers/decorators';
import { Route } from '#types/crud.types';
import { Delete, Get, Patch, Post, Put, SetMetadata } from '@nestjs/common';

/**
 * add NestJs http decorator to the route, such as \@Get("/")
 * @param route
 */
export function addHttpMethod(route: Route, factory: CrudFactory) {
  if (!route.methodName) throw new Error("route's methodName not provided");
  if (
    Reflect.hasMetadata(
      'method',
      factory.controller.prototype[route.methodName],
    )
  )
    return;

  let func =
    route.httpMethod === 'POST'
      ? Post
      : route.httpMethod === 'DELETE'
        ? Delete
        : route.httpMethod === 'PATCH'
          ? Patch
          : route.httpMethod === 'PUT'
            ? Put
            : Get;

  // use @Get() or add "method" and "path" using Reflect.defineMetadata()
  addDecorators(route, func(route.path));
}
