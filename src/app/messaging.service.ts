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

  private ws: WebSocketSubject<any>

  readonly messagesObservable = new Subject<any>()

  constructor(
    private api: ApiService,
    private ui: UiService
  ) {
    this.ws = this.api.ws()

    this.ws.next({ token: api.token })

    this.ws.asObservable().subscribe(data => {
      this.messagesObservable.next(data)
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

  colorPerson(personId: string) {
    return ColorTranslator.toRGB({ h: Math.abs(hashCode(personId) % 360), s: '50%', l: '50%' })
  }

  getOtherMember(group: any) {
    return group.members.find((x: any) => x.personId !== this.ui.me.id)
  }

  getMyMember(group: any) {
    return group.members.find((x: any) => x.personId === this.ui.me.id)
  }

  sendMessage(groupId: string, text: string) {
    this.ws.next({ groupId, text })
  }

  isUnread(group: any) {
    return isBefore(new Date(this.getMyMember(group)?.readUntil), new Date(group.latest.createdAt))
  }

  initial(group: any) {
    return this.name(group)[0]
  }

  name(group: any) {
    return this.getOtherMember(group).person?.name
  }
}
