import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UiService} from "../ui.service";
import {MessagingService} from "../messaging.service";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  @Output() readonly selected = new EventEmitter<any>()

  constructor(public ui: UiService, public messaging: MessagingService, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.messaging.reload()
  }

  select(group: any) {
    this.selected.next(group)
  }

  colorGroup(group: any) {
    return this.colorMember(this.messaging.getOtherMember(group))
  }

  colorMember(member: any) {
    return this.messaging.colorPerson(member.personId)
  }
}
