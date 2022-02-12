import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {UiService} from "../ui.service";
import {of, Subject, switchMap, takeUntil, tap} from "rxjs";
import {ApiService} from "../api.service";

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit, OnDestroy {

  posts: Array<any> = []

  private readonly destroyed = new Subject<void>()

  constructor(public ui: UiService, private api: ApiService, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.ui.changes.pipe(
      tap(() => {
        this.posts = []

        this.cr.detectChanges()
      }),
      takeUntil(this.destroyed),
      switchMap(() => this.ui.location ? this.api.posts(this.ui.location.id) : of([]))
    ).subscribe(it => {
      this.posts = it
      this.cr.detectChanges()
    })
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

  createPost() {
    if (!this.ui.me) {
      alert('Sign in to join hangouts')

      this.ui.auth(() => {
        this.createPost()
      })

      return
    }

    const text = prompt("Add a message")

    if (!text?.trim()) {
      return
    }

    this.api.createPost({
      text,
      locationId: this.ui.location.id
    }).subscribe({
      next: value => {
        this.ui.changes.next(null)
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  imHere() {
    return this.posts.some(x => x.personId === this.ui.me?.id)
  }

  replyToPost(post: any, input: HTMLInputElement) {
    const text = input.value
    input.value = ''

    if (!text.trim()) {
      return
    }

    this.api.replyToPost(post.id, text).pipe(
      takeUntil(this.destroyed)
    ).subscribe({
      next: () => {
        alert('Your message has been sent')
      },
      error: err => {
        alert(err.statusText)
        input.value = text
      }
    })
  }
}
