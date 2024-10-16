import { CrudFactory } from '#crud.factory';
import { Route } from '#types/crud.types';
import { UseInterceptors } from '@nestjs/common';

/**
 * add decorators to the route
 */
export function addDecorators(
  route: Route,
  ...decorators: (MethodDecorator | PropertyDecorator)[]
) {
  route.decorators = [...(route.decorators || []), ...decorators];
}

/**
 * apply the provided decorators to the method
 */
export function applyDecorators(route: Route, factory: CrudFactory) {
  // without reflect-metadata use: `decorator(target, method, descriptor)`
  if (route.decorators?.length) {
    Reflect.decorate(
      route.decorators,
      factory.controller.prototype,
      route.methodName,
      Reflect.getOwnPropertyDescriptor(
        factory.controller.prototype,
        route.methodName,
      ),
    );
  }
}

/**
 * apply the provided interceptors to the method
 */
export function applyInterceptors(route: Route, factory: CrudFactory) {
  if (route.interceptors?.length) {
    Reflect.decorate(
      [UseInterceptors(...route.interceptors)],
      factory.controller.prototype,
      route.methodName,
      Reflect.getOwnPropertyDescriptor(
        factory.controller.prototype,
        route.methodName,
      ),
    );
  }
}
