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

  posts(locationId: string) {
    return this.http.get<any>(`${this.base}/location/${this.key(locationId)}/posts`)
  }

  locationsOf(locationId: string) {
    return this.http.get<any>(`${this.base}/location/${this.key(locationId)}/locations`)
  }

  createPost(post: any) {
    return this.http.post<any>(`${this.base}/posts`, post)
  }

  createLocation(location: any) {
    return this.http.post<any>(`${this.base}/locations`, location)
  }

  private key(id: string) {
    return id.indexOf('/') === -1 ? id : id.split('/')[1]
  }
}
