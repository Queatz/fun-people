import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {

  @Input() locations: Array<any> = []
  @Output() selected = new EventEmitter<any>()

  constructor() { }

  ngOnInit(): void {
  }

}
