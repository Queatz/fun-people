import {Injectable} from '@angular/core';
import {BehaviorSubject, delay, distinctUntilChanged, of, Subscription, switchMap} from "rxjs";
import {Router} from "@angular/router";
import {ApiService} from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class UiService {

  private _location?: any
  private _me?: any
  private updateMeSubscription?: Subscription

  private signinEmail = ''

  get location() { return this._location }

  set location(value: any) {
    this._location = value

    if (value?.url) {
      localStorage.setItem('location', value?.url)
    } else {
      localStorage.removeItem('location')
    }
    this.changes.next(null)
  }

  get me() { return this._me }

  set me(value: any) {
    this._me = value
    this.changes.next(null)
  }

  readonly changes = new BehaviorSubject(null)

  constructor(private router: Router, private api: ApiService) {
    if (router.url === '/') {
      const l = localStorage.getItem('location')

      if (l) {
        this.router.navigate(['/', l])
      }
    }

    this.api.authenticated.subscribe(it => {
      if (!it) {
        this.unauth(true)
      } else {
        this.api.me().subscribe({
          next: me => {
            this.me = me
          },
          error: err => {
            if (err.status === 401) {
              this.unauth()
            }

            alert(err.statusText)
          }
        })
      }
    })
  }

  saveMe() {
    this.updateMeSubscription?.unsubscribe()

    this.updateMeSubscription = of(null).pipe(
      delay(1000),
      switchMap(() => this.api.updateMe({
        name: this.me.name,
        introduction: this.me.introduction,
      }))
    ).subscribe({
      next: me => {
        this.me = me
      },
      error: err => {
        alert(err.statusText)
      },
      complete: () => {
        this.updateMeSubscription = undefined
      }
    })
  }

  unauth(soft = false) {
    this.api.setToken()
    this.me = undefined
    this.signinEmail = ''

    if (!soft) {
      window.location.replace('/')
    }
  }

  auth(callback?: () => void) {
    const email = prompt('Email', this.signinEmail)?.trim()

    if (!email) {
      return
    }

    if (this.signinEmail === email) {
      this.enterCode(email, callback)
      return
    }

    this.signinEmail = email

    this.api.signin(email).subscribe({
      next: () => {
        this.enterCode(email, callback)
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  private enterCode(email: string, callback?: () => void) {
    const code = prompt('Enter code from the email')?.trim()

    if (!code) {
      return
    }

    this.api.signin(email, code).subscribe({
      next: result => {
        this.api.setToken(result.token)
        this.me = result.person
        callback?.()
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  openLocation(location: any) {
    if (!location) {
      this.router.navigate(['/'])
      return
    }

    if (location?.url) {
      this.router.navigate([`/${location.url}`])
    } else if (location?.path) {
      this.api.locationByPath([ ...location.path.map((x: any) => x.name), location.name ]).subscribe({
        next: (location: any) => {
          this.router.navigate([`/${location.url}`])
        },
        error: err => {
          alert(err.statusText)
        }
      })
    }
  }
}
