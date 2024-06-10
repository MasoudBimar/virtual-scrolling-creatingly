import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Directive, forwardRef, Input } from '@angular/core';
import { PostVirtualScrollStrategy } from './post-virtual-scroll';
import { Post } from '../model/post.model';

@Directive({
  selector: '[appPostVirtualScroll]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: (d: PostVirtualScrollDirective) => d._scrollStrategy,
      deps: [forwardRef(() => PostVirtualScrollDirective)],
    },
  ],
})
export class PostVirtualScrollDirective {
  _scrollStrategy = new PostVirtualScrollStrategy();

  private _posts: Post[] = [];

  @Input()
  set posts(value: Post[] | null) {
    if (value && this._posts.length !== value.length) {
      this._scrollStrategy.updatePosts(value);
      this._posts = value;
    }
  }
}
