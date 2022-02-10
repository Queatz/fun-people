import {ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ApiService} from "../api.service";
import {delay, Subject, Subscription, takeUntil} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";

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

  location?: any

  searchQuery = ''
  locations: Array<any> = []

  private searchObservable?: Subscription
  private destroyed = new Subject()

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroyed)
    ).subscribe({
      next: params => {
        const l = params.get('location')
        if (l) {
          this.setLocationUrl(l)
        } else {
          this.location = undefined
        }
        this.cr.detectChanges()
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
      this.location = ''
      return
    }

    this.api.locationByUrl(url).subscribe({
      next: (location: any) => {
        this.location = location
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }
}
