import {
  CdkVirtualScrollViewport,
  VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import { distinctUntilChanged, Observable, Subject } from 'rxjs';
import { Post, PostHeight } from '../model/post.model';

const PaddingAbove = 5;
const PaddingBelow = 5;

export class PostVirtualScrollStrategy implements VirtualScrollStrategy {
  _scrolledIndexChange$ = new Subject<number>();
  scrolledIndexChange: Observable<number> = this._scrolledIndexChange$.pipe(
    distinctUntilChanged(),
  );

  private _viewport!: CdkVirtualScrollViewport | null;
  private _wrapper!: ChildNode | null;
  private _posts: Post[] = [];
  private _heightCache = new Map<number, PostHeight>();

  attach(viewport: CdkVirtualScrollViewport): void {
    this._viewport = viewport;
    this._wrapper = viewport.getElementRef().nativeElement.childNodes[0];

    if (this._posts) {
      this._viewport.setTotalContentSize(this._getTotalHeight());
      this._updateRenderedRange();
    }
  }

  detach(): void {
    this._viewport = null;
    this._wrapper = null;
  }

  onContentScrolled(): void {
    if (this._viewport) {
      this._updateRenderedRange();
    }
  }

  onDataLengthChanged(): void {
    if (!this._viewport) {
      return;
    }

    this._viewport.setTotalContentSize(this._getTotalHeight());
    this._updateRenderedRange();
  }

  onContentRendered(): void {
    /** no-op */
  }

  onRenderedOffsetChanged(): void {
    /** no-op */
  }

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (!this._viewport) {
      return;
    }

    const offset = this._getOffsetByPostIdx(index);
    this._viewport.scrollToOffset(offset, behavior);
  }

  /**
   * Update the posts array.
   *
   * @param posts
   */
  updatePosts(posts: Post[]) {
    this._posts = posts;

    if (this._viewport) {
      this._viewport.checkViewportSize();
    }
  }

  /**
   * Returns the total height of the scrollable container
   * given the size of the elements.
   */
  private _getTotalHeight(): number {
    return this._measurePostsHeight(this._posts);
  }

  /**
   * Returns the offset relative to the top of the container
   * by a provided posts index.
   *
   * @param idx
   * @returns
   */
  private _getOffsetByPostIdx(idx: number): number {
    return this._measurePostsHeight(this._posts.slice(0, idx));
  }

  /**
   * Returns the post index by a provided offset.
   *
   * @param offset
   * @returns
   */
  private _getPostIdxByOffset(offset: number): number {
    let accumOffset = 0;

    for (let i = 0; i < this._posts.length; i++) {
      const pst = this._posts[i];
      const pstHeight = this._getPostHeight(pst);
      accumOffset += pstHeight;

      if (accumOffset >= offset) {
        return i;
      }
    }

    return 0;
  }

  /**
   * Measure posts height.
   *
   * @param posts
   * @returns
   */
  private _measurePostsHeight(posts: Post[]): number {
    return posts
      .map((m) =>  this._getPostHeight(m))
      .reduce((a, c) => a + c, 0);
  }

  /**
   * Determine the number of renderable posts
   * withing the viewport by given posts index.
   *
   * @param startIdx
   * @returns
   */
  private _determinePstsCountInViewport(startIdx: number): number {
    if (!this._viewport) {
      return 0;
    }

    let totalSize = 0;
    const viewportSize = this._viewport.getViewportSize();

    for (let i = startIdx; i < this._posts.length; i++) {
      const pst = this._posts[i];
      totalSize += this._getPostHeight(pst);

      if (totalSize >= viewportSize) {
        return i - startIdx + 1;
      }
    }

    return 0;
  }

  /**
   * Update the range of rendered posts.
   *
   * @returns
   */
  private _updateRenderedRange() {
    if (!this._viewport) {
      return;
    }

    const scrollOffset = this._viewport.measureScrollOffset();
    const scrollIdx = this._getPostIdxByOffset(scrollOffset);
    const dataLength = this._viewport.getDataLength();
    const renderedRange = this._viewport.getRenderedRange();
    const range = {
      start: renderedRange.start,
      end: renderedRange.end,
    };

    range.start = Math.max(0, scrollIdx - PaddingAbove);
    range.end = Math.min(
      dataLength,
      scrollIdx + this._determinePstsCountInViewport(scrollIdx) + PaddingBelow,
    );

    this._viewport.setRenderedRange(range);
    this._viewport.setRenderedContentOffset(
      this._getOffsetByPostIdx(range.start),
    );
    this._scrolledIndexChange$.next(scrollIdx);

    this._updateHeightCache();
  }

  /**
   * Get the height of a given posts.
   * It could be either predicted or actual.
   * Results are memoized.
   *
   * @param m
   * @returns
   */
  private _getPostHeight(m: Post): number {
    let height = 0;
    const cachedHeight = this._heightCache.get(m.id);

    if (!cachedHeight) {
      height = postHeightPredictor(m);
      this._heightCache.set(m.id, { value: height, source: 'predicted' });
    } else {
      height = cachedHeight.value;
    }

    return height;
  }

  /**
   * Update the height cache with the actual height
   * of the rendered post components.
   *
   * @returns
   */
  private _updateHeightCache() {
    if (!this._wrapper || !this._viewport) {
      return;
    }

    const nodes = this._wrapper.childNodes;
    let cacheUpdated: boolean = false;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i] as HTMLElement;

      if (node && node.nodeName === 'app-post-card') {
        const id = node.getAttribute('data-hm-id');
        const cachedHeight = this._heightCache.get(id ? (+id) : 0);

        if (!cachedHeight || cachedHeight.source !== 'actual') {
          const height = node.clientHeight;

          this._heightCache.set(id ? (+id) : 0, { value: height, source: 'actual' });
          cacheUpdated = true;
        }
      }
    }

    if (cacheUpdated) {
      this._viewport.setTotalContentSize(this._getTotalHeight());
    }
  }
}

const Padding = 12 * 2;
const PostMarginTop = 14;
const PostRowHeight = 24;
const PostRowCharCount = 35;

const postHeightPredictor = (m: Post) => {
  const textHeight = Math.ceil(m.title.length / PostRowCharCount) * PostRowHeight;

  const bodyHeight = m.body.length
  ? Math.ceil(m.body.length / PostRowCharCount) * PostRowHeight : 0;

  return ( Padding + PostMarginTop + textHeight + bodyHeight );
};
