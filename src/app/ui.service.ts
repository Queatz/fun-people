import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UiService {

  private _location?: any

  get location() {
    return this._location
  }

  set location(value: any) {
    this._location = value
    this.changes.next(null)
  }

  readonly changes = new BehaviorSubject(null)

  constructor() { }
}
