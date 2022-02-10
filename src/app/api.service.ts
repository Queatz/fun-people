import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private base = "http://localhost:8080"

  constructor(private http: HttpClient) { }

  search(query: string) {
    return this.http.get<Array<any>>(`${this.base}/search/${query}`)
  }

  locationByPath(path: Array<string>) {
    return this.http.get<Array<any>>(`${this.base}/location-name/${path.join('/')}`)
  }

  locationByUrl(url: string) {
    return this.http.get<any>(`${this.base}/location-url/${url}`)
  }
}
