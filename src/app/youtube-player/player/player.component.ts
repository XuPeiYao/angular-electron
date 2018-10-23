/// <reference types="youtube" />
import {
  Component,
  OnInit,
  Input,
  ElementRef,
  EventEmitter,
  Output,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { PlayerStatus } from '../PlayerStatus';
import { v4 as uuid } from 'uuid';
import { Subject, Observable, of } from 'rxjs';
import { skip, buffer, bufferWhen, tap, filter } from 'rxjs/operators';
import clone from 'clone';
@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, AfterViewInit {
  private _status: PlayerStatus = PlayerStatus.Loading;

  private _lifeHook: Subject<string> = new Subject<string>();

  @ViewChild('player')
  private _playerElement: ElementRef;

  public nativePlayer: YT.Player;

  public get status() {
    return this._status;
  }
  @Output()
  public statusChange = new EventEmitter<PlayerStatus>();

  @Input()
  public videoId: string;

  public events = ['afterViewInit', 'sdkLoaded'];

  /**
   * an operator that takes every Nth value
   */
  takeEveryNth = (items: any[]) => <T>(source: Observable<T>) => {
    let cloneAry = clone(items);
    return new Observable<T[]>(observer => {
      let temp: Array<T> = [];
      return source.subscribe({
        next(x) {
          temp.push(x);
          cloneAry = cloneAry.filter(y => y !== x);
          if (!cloneAry.length) {
            observer.next(temp);
            temp = [];
          }
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        }
      });
    });
  }

  constructor() {
    const temp = 2;
    this._lifeHook
      .pipe(
        tap(x => {
          this.events = this.events.filter(y => y !== x);
        }),
        filter(x => {
          return this.events.length === 0;
        })
      )
      .subscribe(x => {
        console.log(x);

        this.initialisePlayer();
      });
    /*this._lifeHook.pipe(skip(1)).subscribe(x => {
      // NPC Gate
      this.initialisePlayer();
    });*/
  }

  //#region LifeHook
  ngOnInit(): void {
    this.initialisePlayerSDK();
  }

  ngAfterViewInit(): void {
    this._lifeHook.next('afterViewInit');
  }
  //#endregion

  /**
   * 初始化播放器SDK載入
   */
  protected initialisePlayerSDK(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const youtubeElId = 'youtubeJsSdk';
      const youtubeScriptEl = document.getElementById(youtubeElId);
      if (this._status !== PlayerStatus.Loading) {
        resolve(true);
      } else {
        (<any>window).onYouTubeIframeAPIReady = () => {
          this._status = PlayerStatus.Initiating;
          this.statusChange.emit(this._status);
          this._lifeHook.next('sdkLoaded');
          resolve(true);
        };
        let js: HTMLScriptElement;
        const scripts = document.getElementsByTagName('script')[0];
        js = document.createElement('script');
        js.id = youtubeElId;
        js.src = '//www.youtube.com/iframe_api';
        scripts.parentNode.insertBefore(js, youtubeScriptEl);
      }
    });
  }

  protected initialisePlayer(): Promise<void> {
    this._playerElement.nativeElement.id = uuid();
    return new Promise(resolve => {
      const player = new YT.Player(this._playerElement.nativeElement.id, {
        videoId: this.videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: () => {
            this._status = PlayerStatus.Buffering;
            this.statusChange.emit(this._status);
            // this._ytPlayer = player;
            resolve();
          },
          onError: (...args) => {
            // this.eventDelegator.call(this, 'onError', args);
          },
          onStateChange: (...args) => {
            console.log(args);
          }
        }
      });
    });
  }
}
