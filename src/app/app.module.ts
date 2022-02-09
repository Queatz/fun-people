import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LocationComponent } from './location/location.component';
import { DetailsComponent } from './details/details.component';
import { MessagesComponent } from './messages/messages.component';
import { SettingsComponent } from './settings/settings.component';
import { PostsComponent } from './posts/posts.component';
import { MessagingComponent } from './messaging/messaging.component';
import {FormsModule} from "@angular/forms";
import { LocationLinkComponent } from './location-link/location-link.component';
import { LocationListComponent } from './location-list/location-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LocationComponent,
    DetailsComponent,
    MessagesComponent,
    SettingsComponent,
    PostsComponent,
    MessagingComponent,
    LocationLinkComponent,
    LocationListComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
