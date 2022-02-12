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

  constructor(public ui: UiService, private api: ApiService, public messaging: MessagingService, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.messaging.reload()
  }

  select(group: any) {
    this.selected.next(group)
  }

  initial(group: any) {
    return this.name(group)[0]
  }

  name(group: any) {
    return this.messaging.getOtherMember(group).person?.name
  }

  colorGroup(group: any) {
    return this.colorMember(this.messaging.getOtherMember(group))
  }

  colorMember(member: any) {
    return this.messaging.colorPerson(member.personId)
  }
}
