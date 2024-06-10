import { CdkScrollable } from '@angular/cdk/scrolling';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Post } from './model/post.model';
import { ScreenService } from './services/screen.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  screenSize = '';
  posts$ = new BehaviorSubject<Post[]>([]);
  pageNumber = 0;
  pageSize = 10;
  @ViewChild(CdkScrollable) scrollable!: CdkScrollable;
  constructor(public http: HttpClient, public screenService: ScreenService) {
    this.screenService.changed.subscribe((changed: boolean) => {
      if (screenService.sizes['screen-large']) {
        this.pageSize = 10;
        this.screenSize = 'Large';
      } else if (screenService.sizes['screen-medium']) {
        this.pageSize = 6;
        this.screenSize = 'meduim';
      } else if (screenService.sizes['screen-small']) {
        this.pageSize = 4;
        this.screenSize = 'small';
      }
      this.loadPosts(true);
    })


  }

  loadPosts(reload: boolean = false) {
    // Efficient Data Loading
    this.http.get('https://jsonplaceholder.typicode.com/posts')
      .subscribe((postItems: any) => {
        let result = (postItems as Post[]).slice(this.pageNumber * this.pageSize, (this.pageNumber + 1) * this.pageSize);
        if (reload) {
          this.pageNumber=0;
          this.posts$.next([...result, ...this.posts$.value]);
        } else {
          this.posts$.next([...result, ...this.posts$.value]);
          this.pageNumber++;
        }
      });
  }
}
