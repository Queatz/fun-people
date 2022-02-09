import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  showMenu = false
  menuTop = 0
  menuLeft = 0
  menuRight = 0

  @ViewChild('menu', { static: false })
  menuEl?: ElementRef

  constructor() { }

  ngOnInit(): void {
  }

  menu(from: HTMLElement) {
    this.menuTop = from.getBoundingClientRect().bottom

    if (from.getBoundingClientRect().right > window.innerWidth / 2) {
      this.menuLeft = 0
      this.menuRight = window.innerWidth - from.getBoundingClientRect().right
    } else {
      this.menuLeft = from.getBoundingClientRect().left
      this.menuRight = 0
    }

    this.showMenu = !this.showMenu

    setTimeout(() => {
      if (this.menuEl) {
        if (this.menuEl.nativeElement.getBoundingClientRect().right > window.innerWidth) {
          this.menuLeft = 0
          this.menuRight = window.innerWidth - from.getBoundingClientRect().right
        }
      }
    })
  }

  @HostListener('window:mouseup', ['$event'])
  closeMenu(event: Event) {
    if ((event.target as HTMLElement)?.className?.indexOf("menu") === -1) {
      this.showMenu = false
    }
  }
}
