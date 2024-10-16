import { isPlatformBrowser } from '@angular/common';
import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { api } from '#configs/api';
import { User } from '#types/dto/user.dto';

export function ApiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  let platform = inject(PLATFORM_ID);
  let authToken = '';

  try {
    let auth = localStorage?.getItem('user');
    if (auth) {
      let user: User = JSON.parse(auth);
      authToken = user.auth_token;
    }
  } catch {}

  let clonedRequest = req.clone({
    url: /^\/?api\//.test(req.url)
      ? `${api.baseUrl}/${req.url
          // remove the prefix '/' if it existing
          .replace(/^\//, '')
          // add apiVersion to urls that starts with /api, but doesn't include a version
          .replace(/^api\/(?!v\d\.\d\/)(.+)/, `api/${api.version}/$1`)}`
      : req.url,
    setHeaders: {
      Authorization: isPlatformBrowser(platform) ? `Bearer ${authToken}` : '',
    },
  });
  return next(clonedRequest);
}
