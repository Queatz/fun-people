import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {UiService} from "../ui.service";
import {ApiService} from "../api.service";
import {Subject, takeUntil} from "rxjs";
import {MessagingService} from "../messaging.service";

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

  constructor(public ui: UiService, private api: ApiService, private messaging: MessagingService, private cr: ChangeDetectorRef) { }

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
    }
  }

  ngOnDestroy() {
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
}
