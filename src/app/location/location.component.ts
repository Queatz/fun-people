import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, AfterViewInit {

  @ViewChild('nav', { static: false })
  navEl!: ElementRef

  content: 'location' | 'messages' = 'location'
  show: 'details' | 'messages' | 'notifications' | 'settings' = 'details'

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.navEl.nativeElement.scrollY = 0
  }

}
