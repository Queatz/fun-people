import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private base = 'http://localhost:8080'

  token?: string

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem("token") || undefined
  }

  ws(): WebSocketSubject<any> {
    return webSocket(`${this.base.replace('http', 'ws')}/ws`)
  }

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

  topLocations() {
    return this.http.get<any>(`${this.base}/top-locations`)
  }

  createPost(post: any) {
    return this.http.post<any>(`${this.base}/posts`, post)
  }

  replyToPost(postId: string, text: string) {
    return this.http.post<any>(`${this.base}/post/${this.key(postId)}/reply`, { text })
  }

  editPost(postId: string, post: any) {
    return this.http.post<any>(`${this.base}/post/${this.key(postId)}`, post)
  }

  removePost(postId: string) {
    return this.http.post<any>(`${this.base}/post/${this.key(postId)}/remove`, null)
  }

  createLocation(location: any) {
    return this.http.post<any>(`${this.base}/locations`, location)
  }

  signin(email: string, code?: string) {
    return this.http.post<any>(`${this.base}/signin`, {
      email,
      code
    })
  }

  me() {
    return this.http.get<any>(`${this.base}/me`)
  }

  postsByMe() {
    return this.http.get<any>(`${this.base}/me/posts`)
  }

  updateMe(me: any) {
    return this.http.post<any>(`${this.base}/me`, me)
  }

  groups() {
    return this.http.get<Array<any>>(`${this.base}/groups`)
  }

  groupMessages(groupId: string) {
    return this.http.get<Array<any>>(`${this.base}/group/${this.key(groupId)}/messages`)
  }

  updateLocation(locationId: string, location: any) {
    return this.http.post<any>(`${this.base}/location/${this.key(locationId)}`, location)
  }

  sendIdea(idea: any) {
    return this.http.post<any>(`${this.base}/ideas`, idea)
  }

  setToken(token?: string) {
    this.token = token

    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  private key(id: string) {
    return id.indexOf('/') === -1 ? id : id.split('/')[1]
  }
}
