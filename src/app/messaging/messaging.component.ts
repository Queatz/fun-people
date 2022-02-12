import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {UiService} from "../ui.service";
import {ApiService} from "../api.service";
import {Subject, takeUntil} from "rxjs";
import {MessagingService} from "../messaging.service";
import {formatDistanceToNow, formatDistanceToNowStrict} from "date-fns";

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit, OnChanges, OnDestroy {

  @Input() group?: any

  messages: Array<any> = []

  sendMessage = ''

  private readonly destroyed = new Subject<void>()

  constructor(public ui: UiService, private api: ApiService, public messaging: MessagingService, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.messaging.messagesObservable.pipe(
      takeUntil(this.destroyed)
    ).subscribe(message => {
      if (message.groupId === this.group.id) {
        this.messages.unshift(message)
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['group']) {
      this.api.groupMessages(this.group.id).pipe(
        takeUntil(this.destroyed)
      ).subscribe({
        next: messages => {
          this.messages = messages

          this.cr.detectChanges()
        },
        error: err => {
          alert(err.statusText)
        }
      })

      if (!changes['group'].isFirstChange() && changes['group'].currentValue !== changes['group'].previousValue) {
        this.messaging.observing(changes['group'].previousValue, false)
      }

      this.messaging.observing(this.group.id, true)
    }
  }

  ngOnDestroy() {
    this.messaging.observing(this.group.id, false)
    this.destroyed.next()
    this.destroyed.complete()
  }

  send() {
    if (!this.group) {
      alert('There was an error')
      return
    }

    this.messaging.sendMessage(this.group.id, this.sendMessage)

    this.sendMessage = ''
  }

  showPhoto(index: number) {
    return index === this.messages.length - 1 || this.messages[index].personId !== this.messages[index + 1].personId
  }

  colorPerson(personId: string) {
      return this.messaging.colorPerson(personId)
  }

  showPerson(person: any) {
    alert(`${person.name}\n\n${person.introduction}`)
  }

  sentAt(message: any) {
    return formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
  }
}
