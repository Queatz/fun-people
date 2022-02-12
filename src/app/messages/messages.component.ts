import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ApiService} from "../api.service";
import {UiService} from "../ui.service";
import {isBefore} from 'date-fns';
import {MessagingService} from "../messaging.service";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  @Output() readonly selected = new EventEmitter<any>()

  groups: Array<any> = []

  constructor(public ui: UiService, private api: ApiService, private messaging: MessagingService, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.api.groups().subscribe({
      next: groups => {
        this.groups = groups

        this.cr.detectChanges()
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  select(group: any) {
    this.selected.next(group)
  }

  initial(group: any) {
    return this.name(group)[0]
  }

  name(group: any) {
    return this.getOtherMember(group).person?.name
  }

  isUnread(group: any) {
    return isBefore(new Date(this.getMyMember(group)?.readUntil), new Date(group.latest.createdAt))
  }

  colorGroup(group: any) {
    return this.colorMember(this.getOtherMember(group))
  }

  colorMember(member: any) {
    return this.messaging.colorPerson(member.personId)
  }

  private getOtherMember(group: any) {
    return group.members.find((x: any) => x.personId !== this.ui.me.id)
  }

  private getMyMember(group: any) {
    return group.members.find((x: any) => x.personId === this.ui.me.id)
  }
}
