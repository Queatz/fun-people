import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {ApiService} from "./api.service";

@Injectable()
export class AuthenticateInterceptor implements HttpInterceptor {

  constructor(private api: ApiService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.addAuthToken(request)).pipe(
      tap({
        error: event => {
          if (event instanceof HttpErrorResponse) {
            if (event.status === 401) {
              setTimeout(() => {
                this.api.setToken()
              })
            }
          }
        }
      })
    )
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
