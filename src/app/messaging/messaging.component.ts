import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit {
  messages = [
    ['Yo! Wassup!', 'Sent from Cafe Collaboration', true],
    ['Yeah man! Was fun'],
    ['I should bring a flashlight next time tho haha'],
    ['lol no worries', '', true, true],
    ['Where did you buy those shoes again btw?', '', true]
  ].reverse()

  sendMessage = ''

  constructor() { }

  ngOnInit(): void {
  }

  send() {
    this.messages.unshift([this.sendMessage, '', true, true])

    this.sendMessage = ''
  }
}
