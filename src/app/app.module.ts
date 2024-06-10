import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { PostCardComponent } from './post-card/post-card.component';
import { InfiniteScrollComponent } from './core/infinite-scroll.component';
import { PostVirtualScrollDirective } from './core/post-virtual-predictor.directive';

@NgModule({
  declarations: [
    AppComponent,
    PostCardComponent,
    InfiniteScrollComponent,
    PostVirtualScrollDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ScrollingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
