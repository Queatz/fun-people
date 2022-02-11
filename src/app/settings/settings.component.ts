import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {UiService} from "../ui.service";
import {filter, Subject, switchMap, takeUntil} from "rxjs";
import {ApiService} from "../api.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  locations: Array<any> = []

  private readonly destroyed = new Subject<void>()

  constructor(public ui: UiService, private api: ApiService, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.ui.changes.pipe(
      takeUntil(this.destroyed),
      filter(() => !!this.ui.me),
      switchMap(() => this.api.postsByMe())
    ).subscribe({
      next: posts => {
        this.locations = posts.map((x: any) => x.location)

        this.cr.detectChanges()
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  ngOnDestroy() {
    this.destroyed.next()
    this.destroyed.complete()
  }

  open(location?: any) {
    this.ui.openLocation(location)
  }
}
