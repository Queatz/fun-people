import {Component, ElementRef, HostListener, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  @Input() items: () => Array<{ name: string, callback: () => void }> = () => []

  menuItems: Array<{ name: string, callback: () => void }> = []

  show = false
  menuTop = 0
  menuLeft = 0
  menuRight = 0

  @ViewChild('menu', { static: false })
  menuEl?: ElementRef

  constructor() { }

  ngOnInit(): void {
  }

  get isOpen() {
    return this.show
  }

  open(from: HTMLElement) {
    this.menuItems = this.items()

    this.menuTop = from.getBoundingClientRect().bottom

    if (from.getBoundingClientRect().right > window.innerWidth / 2) {
      this.menuLeft = 0
      this.menuRight = window.innerWidth - from.getBoundingClientRect().right
    } else {
      this.menuLeft = from.getBoundingClientRect().left
      this.menuRight = 0
    }

    this.show = !this.show

    setTimeout(() => {
      if (this.menuEl) {
        if (this.menuEl.nativeElement.getBoundingClientRect().right > window.innerWidth) {
          this.menuLeft = 0
          this.menuRight = window.innerWidth - from.getBoundingClientRect().right
        }
      }
    })
  }

  close() {
    this.show = false
  }

  @HostListener('window:mouseup', ['$event'])
  closeMenu(event: Event) {
    if (!this.show) {
      return
    }

    if ((event.target as HTMLElement)?.className?.indexOf("menu") === -1) {
        this.show = false
    } else {
      setTimeout(() => {
        this.show = false
      })
    }
  }
}
