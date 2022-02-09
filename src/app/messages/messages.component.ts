import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  @Output() readonly selected = new EventEmitter<void>()

  constructor() { }

  ngOnInit(): void {
  }

  select(): void {
    this.selected.next()
  }
}
