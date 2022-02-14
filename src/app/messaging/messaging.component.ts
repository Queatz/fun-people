import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {UiService} from "../ui.service";
import {ApiService} from "../api.service";
import {
  BehaviorSubject,
  delay,
  distinctUntilChanged,
  filter,
  of,
  Subject,
  Subscription,
  takeUntil,
  throttleTime
} from "rxjs";
import {MessagingService} from "../messaging.service";
import {formatDistanceToNow} from "date-fns";
import {Router} from "@angular/router";

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit, OnChanges, OnDestroy {

  @Input() group?: any

  messages: Array<any> = []

  sendMessage = ''

  typing = ''

  menuOptions = () => [{
    name: 'Leave', callback: () => {
      if (!this.group.id) {
        return
      }

      this.api.leaveGroup(this.group.id).pipe(
        takeUntil(this.destroyed)
      ).subscribe({
        next: () => {
          this.router.navigate(['/'])
        },
        error: err => {
          alert(err.statusText)
        }
      })
    }
  }]

  private typingExpiration?: Subscription
  private readonly destroyed = new Subject<void>()
  private readonly typingDebounce = new Subject<boolean>()

  constructor(public ui: UiService, private api: ApiService, public messaging: MessagingService, private router: Router, private cr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.messaging.messagesObservable.pipe(
      takeUntil(this.destroyed),
      filter(message => message.groupId === this.group.id)
    ).subscribe(message => {
      if (message.typing !== undefined) {
        if (message.typing) {
          this.typing = `${message.name || 'Monkey'} is typing...`
        } else {
          this.typing = ''
        }

        this.typingExpiration?.unsubscribe()

        this.typingExpiration = of(null).pipe(delay(5000)).subscribe(() => {
          this.typing = ''
          this.typingExpiration = undefined
        })
      } else {
        this.messages.unshift(message)
      }
    })

    this.typingDebounce.pipe(
      takeUntil(this.destroyed),
      throttleTime(4000)
    ).subscribe(() => {
      if (this.sendMessage.length > 0) {
        this.messaging.sendTyping(this.group.id, true)
      }
    })

    this.typingDebounce.pipe(
      takeUntil(this.destroyed),
      distinctUntilChanged()
    ).subscribe(() => {
      this.messaging.sendTyping(this.group.id, this.sendMessage.length > 0)
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
    return formatDistanceToNow(new Date(message.createdAt), {addSuffix: true})
  }

  sendTyping() {
    this.typingDebounce.next(this.sendMessage.length > 0)
  }
}
