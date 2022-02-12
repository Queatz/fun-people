import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UiService} from "../ui.service";
import {filter, Subject, takeUntil} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {MessagingService} from "../messaging.service";
import {ApiService} from "../api.service";

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('nav', { static: false })
  navEl!: ElementRef

  content: 'location' | 'messages' = 'location'
  show: 'details' | 'messages' | 'notifications' | 'settings' | 'loading' = 'loading'

  messagesGroup?: any

  private readonly destroyed = new Subject<void>()

  constructor(public ui: UiService, public messaging: MessagingService, private api: ApiService, private route: ActivatedRoute, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroyed)
    ).subscribe({
      next: () => {
        this.show = 'details'
        this.content = 'location'

        this.cr.detectChanges()
      }
    })

    this.api.authenticated.pipe(
      takeUntil(this.destroyed),
      filter(x => !x)
    ).subscribe(() => {
      if (this.show === 'messages') {
        this.show = 'settings'
      }
      this.content = 'location'

      this.cr.detectChanges()
    })
  }

  ngOnDestroy() {
    this.destroyed.next()
    this.destroyed.complete()
  }

  ngAfterViewInit() {
    this.navEl.nativeElement.scrollY = 0
  }

  showMessages(group: any) {
    this.messagesGroup = group
    this.content = 'messages'
  }
}
