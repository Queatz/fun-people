import {Injectable} from '@angular/core';
import {BehaviorSubject, delay, of, Subscription, switchMap} from "rxjs";
import {Router} from "@angular/router";
import {ApiService} from "./api.service";
import {Title} from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class UiService {

  loadingLocation = true

  private _location?: any
  private _me?: any
  private updateMeSubscription?: Subscription

  private signinEmail = ''

  get location() { return this._location }

  set location(value: any) {
    this._location = value
    this.loadingLocation = false

    if (value?.url) {
      localStorage.setItem('location', value?.url)
    } else {
      localStorage.removeItem('location')
    }

    if (value?.name) {
      this.title.setTitle(`${value.name} • Hangoutville`)
    } else {
      this.title.setTitle('Hangoutville')
    }

    this.changes.next(null)
  }

  get me() { return this._me }

  set me(value: any) {
    this._me = value
    this.changes.next(null)
  }

  readonly changes = new BehaviorSubject(null)

  constructor(private router: Router, private api: ApiService, private title: Title) {
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

  setHasNotification(has: boolean) {
    const favicon = document.querySelector<HTMLLinkElement>("#favicon")
    console.log(favicon)
    favicon!.href = has ? 'favicon-notification.png' : 'favicon.png'
  }

  saveMe() {
    this.updateMeSubscription?.unsubscribe()

    this.updateMeSubscription = of(null).pipe(
      delay(5000),
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
    const email = prompt('Sign in with email', this.signinEmail)?.trim()

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

        if (!this.me?.name) {
          const name = prompt('Enter your name')

          if (name?.trim()) {
            this.setName(name)
          }
        }

        callback?.()
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  openLocation(location: any) {
    if (!location) {
      if ( !this.location) {
        alert('Hold up! There\'s still thins to do here.')
      } else {
        this.router.navigate(['/'])
      }
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

  private setName(name: string) {
    this.me.name = name.trim()
    this.saveMe()
  }
}
