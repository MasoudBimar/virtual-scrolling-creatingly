import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  changed = new BehaviorSubject<boolean>(true);

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large])
      .subscribe(() => this.changed.next(true));
  }

  private isLargeScreen(): boolean {
    const isLarge = this.breakpointObserver.isMatched(Breakpoints.Large);
    const isXLarge = this.breakpointObserver.isMatched(Breakpoints.XLarge);

    return isLarge || isXLarge;
  }

  private isSmallScreen(): boolean {
    const isSmall = this.breakpointObserver.isMatched(Breakpoints.Small);
    const isXSmall = this.breakpointObserver.isMatched(Breakpoints.XSmall);

    return isSmall || isXSmall;
  }

  public get sizes(): Record<string, boolean> {
    return {
      'screen-small': this.isSmallScreen(),
      'screen-medium': this.breakpointObserver.isMatched(Breakpoints.Medium),
      'screen-large': this.isLargeScreen(),
    };
  }
}
