import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { REQUEST } from '~tokens';
import { Request } from 'express';
import { inject } from '@angular/core';

export function UniversalInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  try {
    // todo: make it optional, as REQUEST token is available in SSR only
    let request: Request = inject(REQUEST);

    let clonedRequest = req.clone({
      url: /^https?:/.test(req.url)
        ? req.url
        : // request.hostname return 'localhost', but .get('host') returns 'localhost:4200'
          `${request.protocol}://${request.get('host')}${
            req.url.startsWith('/') ? '' : '/'
          }${req.url}`,
    });
    return next(clonedRequest);
    // todo: make it optional (in browser it is undefined)
    // https://github.com/angular/angular/issues/47164#issuecomment-1216412333
  } catch (error) {
    console.warn('[universal.interceptor', error);
    return next(req);
  }
}
