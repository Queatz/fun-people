import {ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ApiService} from "../api.service";
import {delay, filter, Subject, Subscription, switchMap, takeUntil} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {UiService} from "../ui.service";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {

  showMenu = false
  menuTop = 0
  menuLeft = 0
  menuRight = 0

  @ViewChild('menu', { static: false })
  menuEl?: ElementRef

  searchQuery = ''
  locations: Array<any> = []

  private searchObservable?: Subscription
  private destroyed = new Subject()

  constructor(public ui: UiService, private api: ApiService, private route: ActivatedRoute, private router: Router, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroyed)
    ).subscribe({
      next: params => {
        const l = params.get('location')
        if (l) {
          this.setLocationUrl(l)
        } else {
          this.ui.location = undefined
        }
        this.cr.detectChanges()
      }
    })

    this.ui.changes.pipe(
      takeUntil(this.destroyed),
      filter(() => !!this.ui.location),
      switchMap(() => this.api.locationsOf(this.ui.location?.id))
    ).subscribe({
      next: locations => {
        this.locations = locations
      },
      error: err => {
        alert(err)
      }
    })
  }

  ngOnDestroy() {
    this.destroyed.next(null)
    this.destroyed.complete()
  }

  menu(from: HTMLElement) {
    this.menuTop = from.getBoundingClientRect().bottom

    if (from.getBoundingClientRect().right > window.innerWidth / 2) {
      this.menuLeft = 0
      this.menuRight = window.innerWidth - from.getBoundingClientRect().right
    } else {
      this.menuLeft = from.getBoundingClientRect().left
      this.menuRight = 0
    }

    this.showMenu = !this.showMenu

    setTimeout(() => {
      if (this.menuEl) {
        if (this.menuEl.nativeElement.getBoundingClientRect().right > window.innerWidth) {
          this.menuLeft = 0
          this.menuRight = window.innerWidth - from.getBoundingClientRect().right
        }
      }
    })
  }

  @HostListener('window:mouseup', ['$event'])
  closeMenu(event: Event) {
    if ((event.target as HTMLElement)?.className?.indexOf("menu") === -1) {
      this.showMenu = false
    } else {
      setTimeout(() => {
        this.showMenu = false
      })
    }
  }

  @HostListener('window:keyup.escape')
  up() {
    if (this.showMenu) {
      this.showMenu = false
      return
    }

    const location = this.ui.location?.path?.[0]
    if (location) {
      this.open(location)
    } else {
      this.open()
    }
  }

  search() {
    this.searchObservable?.unsubscribe()

    if (!this.searchQuery.trim()) {
      return
    }

    this.searchObservable = this.api.search(this.searchQuery).pipe(
      delay(100)
    ).subscribe({
      next: results => {
        this.locations = results.map(x => ({
          url: x.url,
          name: x.name,
          path: x.path,
          description: x.description || [ ...x.path ].reverse()?.map((x: any) => x.name)?.join(', ') || ''
        }))

        this.cr.detectChanges()
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  open(location?: any) {
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

  setLocationUrl(url?: string) {
    if (!url) {
      this.ui.location = ''
      return
    }

    this.api.locationByUrl(url).subscribe({
      next: (location: any) => {
        this.ui.location = location
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  addLocation() {
    if (!this.ui.location) {
      return
    }

    const name = prompt('Location name')

    if (!name?.trim()) {
      return
    }

    this.api.createLocation({
      locationId: this.ui.location.id,
      name
    }).subscribe({
      next: () => {
        this.ui.changes.next(null)
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  editDescription() {
    if (!this.ui.location) {
      return
    }

    const description = prompt('Location description', this.ui.location.description)

    if (!description?.trim()) {
      return
    }

    this.api.updateLocation(this.ui.location.id, {
      description
    }).subscribe({
      next: location => {
        this.ui.location = location
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }
}
