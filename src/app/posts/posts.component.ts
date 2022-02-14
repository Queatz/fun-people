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

  loading = true
  posts: Array<any> = []

  private readonly destroyed = new Subject<void>()

  constructor(public ui: UiService, private api: ApiService, private cr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.ui.changes.pipe(
      tap(() => {
        this.loading = true
        this.posts = []

        this.cr.detectChanges()
      }),
      takeUntil(this.destroyed),
      switchMap(() => this.ui.location ? this.api.posts(this.ui.location.id) : of([]))
    ).subscribe({
      next: it => {
        this.loading = false
        this.posts = it
        this.cr.detectChanges()
      },
      error: err => {
        alert(err.statusText)
      }
    })
  }

  ngOnDestroy() {
    this.destroyed.next()
    this.destroyed.complete()
  }

  createPost() {
    if (!this.ui.me) {
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

  signin() {
    if (this.ui.me) {
      return
    }

    this.ui.auth()
  }
}
