import {
  Body,
  Param,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type {
  CrudOptions,
  HttpMethod,
  InitCrudOptions,
  InitRoute,
  Route,
} from './types/crud.types';
import { defaultOptions } from '#crud.options';
import { addHttpMethod } from '#add-decorators/add-http-method';
import { addSwaggerParams } from '#add-decorators/add-swagger-params';
import { routeHandler } from '#route-handler';
import { addSwaggerOperation } from '#add-decorators/add-swagger-operation';
import {
  addDecorators,
  applyDecorators,
  applyInterceptors,
} from '#helpers/decorators';
import { addSwaggerBody } from '#add-decorators/add-swagger-body';
import { addSwaggerResponse } from '#add-decorators/add-swagger-response';
import { shallowMerge } from '#utils/objects';
import { QueryInterceptor } from '#interceptors/query.interceptor';
// import 'reflect-metadata';

// todo: add decorators[] to decorate the class itself
export class CrudFactory {
  public options: CrudOptions;

  constructor(
    // eslint-disable-next-line @typescript-eslint/ban-types
    public controller: Function,
    //  if options is provided as a function, the consumer has to maintain the merge strategy
    options?: InitCrudOptions | ((defaultOptions: CrudOptions) => CrudOptions),
  ) {
    let proto = controller.prototype,
      // the defaultOptions is adjusted before the user receive it
      // and the options returned by the user need to be adjusted
      opts =
        typeof options === 'function'
          ? options(this.adjustRoutes(defaultOptions))
          : { ...options },
      existingRoutes = Reflect.ownKeys(proto)
        .filter((key) => typeof proto[key] === 'function')
        // convert symbol to string
        .map((key) => String(key))
        .filter(
          (key) =>
            key !== 'constructor' &&
            // a method can be excluded from crud handling by adding `@CrudRoute(false)`
            Reflect.getMetadata('crudRoute', proto, key) !== false &&
            // skip methods that are already included in routes[]
            !opts.routes?.some((route) => route.methodName === key),
        )
        // convert method to InitRoute{}
        .map((methodName) => {
          let crudRoute: InitRoute = Reflect.getMetadata(
            'crudRoute',
            proto,
            methodName,
          );

          return {
            methodName,
            path: Reflect.getMetadata('path', proto[methodName]),
            ...crudRoute,
          } as InitRoute;
        });

    opts.routes = [...(opts.routes || []), ...existingRoutes];
    this.options = this.adjustRoutes(opts);
    this.createRoutes();
  }

  // todo: merge matched routes (by route.methodName or by path, many and httpMethod)
  // the last one override the previous one
  adjustRoutes(opts: InitCrudOptions = this.options): CrudOptions {
    return <CrudOptions>{
      ...opts,
      routes: opts?.routes?.map((el) => {
        let route = { ...el };

        // NestJs request methods
        let requestMethods = [
          'GET',
          'POST',
          'PUT',
          'DELETE',
          'PATCH',
          'ALL',
          'OPTIONS',
          'HEAD',
          'SEARCH',
        ];
        // capitalize route.httpMethod to much the HttpMethod type
        route.httpMethod = <HttpMethod>(
          (typeof route.httpMethod === 'number'
            ? requestMethods[route.httpMethod]
            : (<HttpMethod>route.httpMethod)?.toUpperCase() || 'GET')
        );
        route.primaryKey = route.primaryKey || opts.primaryKey || 'id';

        // generate the default methodName from path
        // examples
        //   - {path: "users/:id"} -> "getOneUserById"
        //   - {path: "users/:userId/profiles/:profileId/posts", many:true} -> "getManyUsersByUserIdProfilesProfileIdPosts"
        route.methodName =
          route.methodName ||
          route.httpMethod!.toLowerCase() +
            (route.httpMethod === 'POST' ? '' : route.many ? 'Many' : 'One');

        route.operationId =
          route.operationId ||
          `${this.controller.name}_${String(route.methodName)}`;

        if (!route.path) {
          // for "*One()" operations, add /:id path param
          // example: GET /users/:id
          route.path =
            route.many || ['POST'].includes(route.httpMethod)
              ? '/'
              : `/:${route.primaryKey}`;
        }

        route.pathParams = route.pathParams
          ? route.pathParams.map((param) =>
              typeof param === 'string'
                ? { name: param, schema: { type: 'string' }, required: true }
                : param,
            )
          : // generate path params from route.path
            // matches `:id`, `/:id` and `other/:id/:userId`
            [...route.path.matchAll(/^\/?:([^/]+)/g)].map((match) => ({
              name: match[1],
              schema: { type: 'string' },
              required: true,
            }));

        // todo: generate the corresponding service methods
        //  +route.path
        //     // remove the leading "/"
        //     .replace(/^\//, '')
        //     .replace(/^:/,'By')
        //     // replace "/:id" with "ById"
        //     .replaceAll(/\/:/g, '/By')
        //     .split('/')
        //     // convert parts to camel case
        //     // example: "users/profiles" -> "usersProfiles"
        //     .map((el, idx) =>
        //       idx === 0 ? el : el.charAt(0).toUpperCase() + el.slice(1),
        //     )
        //     .join('');

        // override options per route
        // for example: route.primaryKey = route.primaryKey || opts.primaryKey
        // when opts.model is a class that extends another class, an exception is thrown `OtherClass is not defined`
        // todo: we may need to exclude other keys that have a class value such as errorResponseModel
        let { routes, model, ...otherOptions } = opts;
        route = <Route>shallowMerge(otherOptions, route);

        // merge arrays
        ['decorators', 'interceptors'].map((key) => {
          route[key as keyof typeof route] = [
            ...(opts[key as keyof typeof opts] || []),
            ...(route[key as keyof typeof route] || []),
          ];
        });

        // merge empty arrays
        // for example if route.interceptors=[] but opts.interceptors has values, opts.interceptors is used
        // Object.keys(opts).map((key) => {
        //   if (Array.isArray(key) && !route[key as keyof typeof route]?.length) {
        //     route[key as keyof typeof route] =
        //       opts[key as keyof typeof opts] || [];
        //   }
        // });

        route.interceptors!.push(
          new QueryInterceptor({ ...opts.query, ...route.query }),
        );

        return route;
      }),
    };
  }

  mergeOptions(userOptions: InitCrudOptions = {}): CrudOptions {
    // todo: enable global options
    let globalOptions: InitCrudOptions = {};

    let opts = <CrudOptions>(
      shallowMerge(defaultOptions, globalOptions, userOptions)
    );

    // merge arrays
    // to override the default option, use this.options as a function
    // check InitCrudOptions for array fields
    [
      'decorators',
      'interceptors',
      'routes',
      'queryParams',
      'responseModels',
    ].map((key) => {
      opts[key as keyof typeof opts] = [
        ...(defaultOptions[key as keyof typeof defaultOptions] || []),
        ...(globalOptions[key as keyof typeof globalOptions] || []),
        ...(userOptions[key as keyof typeof userOptions] || []),
      ];
    });

    // todo: merge matched queryParams (by name)
    // the later override the previous one
    // opts.queryParams?.map((param) => {
    //   let existingQueryParam = opts.queryParams!.findIndex(
    //     (el) => el.name === param.name,
    //   );

    //   opts.queryParams!.push(
    //     existingQueryParam > -1
    //       ? {
    //           ...opts.queryParams![existingQueryParam],
    //           ...param,
    //         }
    //       : param,
    //   );
    // });

    return opts;
  }

  createRoutes() {
    let routes = this.options.routes,
      controller = this.controller.prototype;

    routes
      ?.filter((route) => route.disabled === undefined || !route.disabled)
      .map((route) => {
        // create a route method and add it to the controller
        // todo: use interceptor to create ParsedRequest
        if (!controller[route.methodName]) {
          controller[route.methodName] = routeHandler(route, this);

          // inject the required params
          // similar to patchOne(@Req() req: Request, @Query() query, @Body() dto: MyEntity, @Param("id") id:string)
          // we can get other info such as body and params from req
          // without the need to inject @Body() and @Query()
          // todo: route.primary || getPrimaryKeyFromEntity(opts.model) || "id"
          let paramKey = route.primaryKey || 'id';
          Req()(this.controller.prototype, route.methodName, 0);
          Query()(this.controller.prototype, route.methodName, 1);
          if (['GET', 'DELETE'].includes(route.httpMethod) && !route.many) {
            Param(paramKey)(this.controller.prototype, route.methodName, 2);
          } else if (route.httpMethod === 'POST') {
            Body()(this.controller.prototype, route.methodName, 2);
          } else if (['PATCH', 'PUT'].includes(route.httpMethod)) {
            Body()(this.controller.prototype, route.methodName, 2);
            // primaryKey is undefined if route.many
            Param(paramKey)(this.controller.prototype, route.methodName, 3);
          }
        }
        return route;
      })
      .forEach((route) => this.addRouteDecorators(route));
  }

  /**
   * add decorators to the route
   */
  addRouteDecorators(route: Route) {
    // annotations are added only if:
    // - the method listed in this.options.routes[] and doesn't has @CrudRoute(false)
    // - the method is not listed and has @crudRoute(options?)
    // if the method is not listed and doesn't has @crudRoute(), the annotations will not be added
    // if no http decorator already applied such as @GET()
    // when adding @Get(), nest adds "method" and "path" metadata
    addHttpMethod(route, this);
    addSwaggerOperation(route, this);
    addSwaggerParams(route, this);
    addSwaggerBody(route, this);
    addSwaggerResponse(route, this);
    // add validationPipe
    addDecorators(route, UsePipes(new ValidationPipe({ groups: [] })));

    // apply decorators to the route after adding all decorators
    applyDecorators(route, this);
    applyInterceptors(route, this);
  }
}
