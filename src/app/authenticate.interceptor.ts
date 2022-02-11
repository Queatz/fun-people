import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {ApiService} from "./api.service";

@Injectable()
export class AuthenticateInterceptor implements HttpInterceptor {

  constructor(private api: ApiService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.addAuthToken(request));
  }

  private addAuthToken(request: HttpRequest<any>) {
    const token = this.api.token

    if (!token) {
      return request
    }

    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}
