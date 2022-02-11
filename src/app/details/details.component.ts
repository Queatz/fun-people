import {
  ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ApiService} from "../api.service";
import {delay, filter, of, Subject, Subscription, switchMap, takeUntil} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {UiService} from "../ui.service";
import {MenuComponent} from "../menu/menu.component";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {

  @Output() locationChanged = new EventEmitter<void>()

  @ViewChild('menu', { static: false, read: MenuComponent })
  menu?: MenuComponent

  loading = true
  searchQuery = ''
  searchResultsShown = false
  locations: Array<any> = []

  private searchObservable?: Subscription
  private readonly destroyed = new Subject<void>()

  menuItems = () => [
    { name: 'Edit description', callback: () => this.editDescription() },
    { name: 'Manage permissions', callback: () => this.addLocation() },
    { name: 'Add a hangout', callback: () => this.addLocation() }
  ]

  constructor(public ui: UiService, private api: ApiService, private route: ActivatedRoute, private router: Router, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroyed)
    ).subscribe({
      next: params => {
        const l = params.get('location') || undefined
        this.setLocationUrl(l)
        this.locationChanged.next()

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
    this.destroyed.next()
    this.destroyed.complete()
  }

  @HostListener('window:keyup.escape')
  up() {
    if (this.menu?.isOpen) {
      this.menu?.close()
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
      this.searchResultsShown = false
      this.locations = []
      this.setLocationUrl()
      return
    }

    this.searchObservable = of(null).pipe(
      delay(100),
      switchMap(() => this.api.search(this.searchQuery))
    ).subscribe({
      next: results => {
        this.searchResultsShown = true
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
    this.ui.openLocation(location)
  }

  setLocationUrl(url?: string) {
    if (!url) {
      this.loading = false
      this.ui.location = undefined

      this.api.topLocations().pipe(
        takeUntil(this.destroyed)
      ).subscribe({
        next: (locations: Array<any>) => {
          this.locations = locations
        },
        error: err => {
          alert(err.statusText)
        },
        complete: () => {
          this.loading = false

          this.cr.detectChanges()
        }
      })

      return
    }

    this.loading = true

    this.api.locationByUrl(url).pipe(
      takeUntil(this.destroyed)
    ).subscribe({
      next: (location: any) => {
        this.ui.location = location
      },
      error: err => {
        alert(err.statusText)
      },
      complete: () => {
        this.loading = false

        this.cr.detectChanges()
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
