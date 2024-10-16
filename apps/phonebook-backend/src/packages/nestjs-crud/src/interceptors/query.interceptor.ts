import { CrudOptions } from '#types/crud.types';
import { shallowMerge } from '#utils/objects';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * merge options.query with the current query.
 *
 * this ensures opts.query{} is merged to the existing user routes too,
 * not only the routes that are generated by \@Crud()
 */
@Injectable()
export class QueryInterceptor implements NestInterceptor {
  constructor(private readonly query: CrudOptions['query']) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let req = context.switchToHttp().getRequest();

    if (req.method.toUpperCase() === 'GET') {
      // todo: if(req.query is object)
      if (typeof req.query !== 'string') {
        req.query = shallowMerge(this.query, req.query);
      }
    }

    return next.handle();
  }
}