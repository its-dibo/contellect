/* eslint-disable @typescript-eslint/ban-types */

import { CrudFactory } from '#crud.factory';
import { Route } from '#types/crud.types';
import { shallowMerge } from '#utils/objects';
import { HttpException } from '@nestjs/common';

/**
 * returns a route handler that receives the Request object as its first arg
 */
export function routeHandler(route: Route, factory: CrudFactory) {
  let serviceName = factory.options?.serviceName || 'service';
  // don't convert this to arrow function, so `this` here refers to the Controller class
  // don't use factory.controller.prototype[serviceName] as service will be undefined
  // todo: query type
  return function (req: Request, query: any, ...params: any) {
    // @ts-ignore
    let service = this[serviceName];

    if (!service) {
      throw new HttpException(
        `this.${serviceName} is not defined, please inject the service`,
        500,
      );
    }

    if (!service[route.methodName]) {
      throw new HttpException(
        `the method this.${serviceName}.${route.methodName}() is not defined in the service`,
        500,
      );
    } else if (typeof service[route.methodName] !== 'function') {
      throw new HttpException(
        `this.${serviceName}.${route.methodName} is not a method`,
        500,
      );
    }

    try {
      // todo: send the proper params to each operation
      // getOne(id), postOne(body), patchOne(id,body)
      if (factory.options.maxLimit && query.take > factory.options.maxLimit) {
        query.take = factory.options.maxLimit;
      }
      return service[route.methodName](...params, query, req);
    } catch (error: any) {
      // todo: get class name using Reflect
      console.error(
        `error at ${factory.controller.name}.${route.methodName}()`,
        error,
      );
      throw new HttpException(error?.message || error, 500);
    }
  };
}
