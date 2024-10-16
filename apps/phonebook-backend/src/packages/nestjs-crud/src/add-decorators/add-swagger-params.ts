import { CrudFactory } from '#crud.factory';
import { addDecorators } from '#helpers/decorators';
import { Route } from '#types/crud.types';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

/**
 * add Swagger's \@ApiQuery() and \ApiParam() for each param
 * @param route
 */
export function addSwaggerParams(route: Route, factory: CrudFactory) {
  if (
    Reflect.hasMetadata(
      'swagger/apiParameters',
      factory.controller.prototype,
      route.methodName,
    )
  )
    return;

  let queryParams = route.queryParams || factory.options?.queryParams;
  queryParams?.map((param) => {
    // exclude params that doesn't match the route
    if (param.many === false && route.many) return;
    if (param.many === true && !route.many) return;

    if (param.httpMethods && !param.httpMethods.includes(route.httpMethod))
      return;

    if (!param.type && ['number', 'string'].includes(typeof param.example))
      param.type = typeof param.example;
    else if (
      param.type === 'array' ||
      (Array.isArray(param?.example) && !param.type && !param.schema)
    ) {
      param = {
        schema: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        // add items as array to prevent sending items as v1%2Cv2 instead of v1,v2
        // converts the array into ?key=v1,v2,...
        style: 'form',
        // don't generate separate params for each item
        // i.e. ?key=v1&key=v2
        explode: false,
        ...param,
      };

      delete param.type;
    }

    // if param.required not provided, set it to false
    param.required = !!param.required;

    // add swagger examples to the description
    // and remove it to prevent swagger from pre-filling the fields in swagger UI
    // todo: add opts.fillExamples to allow pre-filling the fields with examples
    if (param.example) {
      param.description =
        (param.description || '') +
        (param.description ? ' ' : '') +
        'example: ' +
        JSON.stringify(param.example);

      delete param.example;
    }

    addDecorators(route, ApiQuery(param));
  });

  route.pathParams?.map((param) => addDecorators(route, ApiParam(param)));
}
