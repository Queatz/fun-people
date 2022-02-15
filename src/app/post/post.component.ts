import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UiService} from "../ui.service";
import {ApiService} from "../api.service";
import {Subject, takeUntil} from "rxjs";
import {MessagingService} from "../messaging.service";

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy {

  @Input() post!: any

  replyMessage = ''

  private readonly destroyed = new Subject<void>()

  constructor(public ui: UiService, public messaging: MessagingService, private api: ApiService, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroyed.next()
    this.destroyed.complete()
  }

  menuItems(post: any) {
    return () => [
      {
        name: 'Edit message', callback: () => {
          const text = prompt('Post', post.text || '')

          if (!text?.trim()) {
            return
          }

          this.api.editPost(post.id, {text}).subscribe({
            next: () => {
              this.ui.changes.next(null)
            },
            error: err => {
              alert(err.statusText)
            }
          })
        }
      },
      {
        name: 'Leave hangout', callback: () => {
          this.api.removePost(post.id).subscribe({
            next: () => {
              this.ui.changes.next(null)
            },
            error: err => {
              alert(err.statusText)
            }
          })
        }
      }
    ]
  }

  showPerson(person: any) {
    alert(`${person.name}\n\n${person?.introduction}`)
  }

  replyToPost() {
    if (!this.ui.me) {
      this.ui.auth(() => {
        this.replyToPost()
      })
      return
    }

    const text = this.replyMessage
    this.replyMessage = ''

    if (!text.trim()) {
      return
    }

    this.api.replyToPost(this.post.id, text).pipe(
      takeUntil(this.destroyed)
    ).subscribe({
      next: () => {
        alert('Your message has been sent')
      },
      error: err => {
        alert(err.statusText)
        this.replyMessage = text
      }
    })
  }

  signin() {
    if (this.ui.me) {
      return
    }

    this.ui.auth()
  }
}
