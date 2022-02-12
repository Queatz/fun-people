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
  menuBottom = 0
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

    if (from.getBoundingClientRect().bottom < window.innerHeight / 2) {
      this.menuTop = from.getBoundingClientRect().bottom
      this.menuBottom = 0
    } else {
      this.menuTop = 0
      this.menuBottom = window.innerHeight - from.getBoundingClientRect().top
    }

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

    const isInMenu = this.menuEl?.nativeElement?.contains((event.target as HTMLElement))

    if (!isInMenu) {
        this.show = false
    } else {
      setTimeout(() => {
        this.show = false
      })
    }
  }
}
