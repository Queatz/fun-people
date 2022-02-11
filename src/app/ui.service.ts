import {Injectable} from '@angular/core';
import {BehaviorSubject, delay, Subscription} from "rxjs";
import {Router} from "@angular/router";
import {ApiService} from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class UiService {

  private _location?: any
  private _me?: any
  private updateMeSubscription?: Subscription

  get location() { return this._location }

  set location(value: any) {
    this._location = value
    this.changes.next(null)
  }

  get me() { return this._me }

  set me(value: any) {
    this._me = value
    this.changes.next(null)
  }

  readonly changes = new BehaviorSubject(null)

  constructor(private router: Router, private api: ApiService) {
    if (api.token) {
      this.api.me().subscribe({
        next: me => {
          this.me = me
        },
        error: err => {
          if (err.status === 401) {
            this.api.setAuth(undefined)
            this.me = undefined
          }

          alert(err.statusText)
        }
      })
    }
  }

  unauth() {
    this.me = undefined

    this.router.navigate(['/'])
  }

  auth() {
    const email = prompt('Email')

    if (!email?.trim()) {
      return
    }

    this.api.signin(email).subscribe({
      next: () => {
        this.enterCode(email)
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  saveMe() {
    this.updateMeSubscription?.unsubscribe()

    this.updateMeSubscription = this.api.updateMe({
      name: this.me.name
    }).pipe(
      delay(1000)
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

  private enterCode(email: string) {
    const code = prompt('Enter code from the email')

    if (!code?.trim()) {
      return
    }

    this.api.signin(email, code).subscribe({
      next: result => {
        this.api.setAuth(result.token)
        this.me = result.person
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }
}
