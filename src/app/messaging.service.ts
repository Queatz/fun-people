import { Injectable } from '@angular/core';
import {ColorTranslator} from "colortranslator";
import {hashCode} from "./util";
import {UiService} from "./ui.service";
import {ApiService} from "./api.service";
import {WebSocketSubject} from "rxjs/webSocket";
import {Subject} from "rxjs";
import {isBefore} from "date-fns";

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  groups: Array<any> = []

  get hasUnread() {
    return !!this.groups.find(x => this.isUnread(x))
  }

  private ws?: WebSocketSubject<any>

  private observations = new Map<string, number>()

  private audio = new Audio('/assets/message.mp3')

  readonly messagesObservable = new Subject<any>()

  constructor(
    private api: ApiService,
    private ui: UiService
  ) {
    this.audio.load()

    const reconnect = () => {
      this.ws = this.api.ws()

      this.ws.asObservable().subscribe({
        next: message => {
          const group = this.groups.find(x => x.id === message.groupId)

          if (message.typing === undefined) {
            if (group) {
              group.latest = message

              if (this.observations.get(message.groupId)) {
                const member = this.getMyMember(group)

                if (member) {
                  member.readUntil = message.createdAt
                }
              }
            }

            if (message.personId !== this.ui.me?.id) {
              this.audio.play()
            }
          }

          this.messagesObservable.next(message)
        },
        error: err => {
          console.log(err)

          this.ws = undefined

          setTimeout(() => {
            if (this.api.token) {
              reconnect()
            }
          }, 2000)
        },
        complete: () => {
          this.ws = undefined

          if (this.api.token) {
            reconnect()
          }
        }
      })

      this.auth()
    }

    this.api.authenticated.subscribe(authenticated => {
      if (authenticated) {
        if (this.ws?.closed !== false) {
          reconnect()
        } else {
          this.auth()
        }

        this.reload()
      } else {
        this.ws?.complete()
        this.ws?.unsubscribe()
      }
    })
  }

  reload() {
    this.api.groups().subscribe({
      next: groups => {
        this.groups = groups
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  colorPerson(personId?: string) {
    return ColorTranslator.toRGB({ h: Math.abs(hashCode(personId || '') % 360), s: personId ? '50%' : '0%', l: '50%' })
  }

  getOtherMember(group: any) {
    return group.members.find((x: any) => x.personId !== this.ui.me?.id)
  }

  getMyMember(group: any) {
    return group.members.find((x: any) => x.personId === this.ui.me?.id)
  }

  sendMessage(groupId: string, text: string) {
    this.ws?.next({ groupId, text })
  }

  sendTyping(groupId: string, typing: boolean) {
    this.ws?.next({ groupId, typing })
  }

  isUnread(group: any) {
    return isBefore(new Date(this.getMyMember(group)?.readUntil), new Date(group.latest.createdAt))
  }

  initial(group: any) {
    return this.name(group)?.[0]
  }

  name(group: any) {
    return this.personName(this.getOtherMember(group)?.person)
  }

  personName(person: any) {
    return !person ? 'Nobody' : person.name || 'Monkey'
  }

  observing(groupId: string, isObserving: boolean) {
    const observations = this.observations.get(groupId) || 0

    if (isObserving) {
      this.updateGroupReadUntil(groupId)

      this.observations.set(groupId, observations + 1)
    } else if (observations > 0) {
      this.observations.set(groupId, observations - 1)
    }
  }

  private updateGroupReadUntil(groupId: string) {
    const group = this.groups.find(x => x.id === groupId)

    if (group) {
      const member = this.getMyMember(group)

      if (member) {
        member.readUntil = group.latest.createdAt
      }
    }
  }

  private auth() {
    this.ws!.next({token: this.api.token})
  }
}
