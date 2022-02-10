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

  private destroyed = new Subject()

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
    this.destroyed.next(null)
    this.destroyed.complete()
  }

  createPost() {
    const text = prompt("Post")

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
}
