import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as ReconnectingWebSocket  from 'reconnecting-websocket';

/*
  Generated class for the PlayerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PlayerProvider {
  public totalPlayTime = 0;
  public offsetMilliSeconds: number = 0;

  public currentMediaItem: { uri: string, id: string, name: string, image: string, duration: number} = 
    { uri: "", id: "", name: "unknown", image: '../assets/imgs/cover.default.png', duration: 100};

  private renderer: Subject<{}>;
  private rws: ReconnectingWebSocket ;
  private rendererUri = "/media/renderers/d6ebfd90-d2c1-11e6-9376-df943f51f0d8";
  public isPlaying:boolean;

  constructor(public http: HttpClient) {
    this.listen();
    this.renderer = new Subject();

    // demo
    this.renderer.subscribe((nextRenderer:any)=>{
      console.log("rxjs ", nextRenderer)
      this.isPlaying = nextRenderer.state === "play";
      this.offsetMilliSeconds = nextRenderer.offset;
      this.currentMediaItem = nextRenderer.currentMediaItem;
      this.currentMediaItem.image = this.currentMediaItem.image ? "http://127.0.0.1:3000/" + this.currentMediaItem.image : '../assets/imgs/cover.default.png';
      this.totalPlayTime = this.currentMediaItem.duration || 0;
      }
    )
  }

  private paddy(number, padding, fillingCharacter = "0") {
    var pad = new Array(1 + padding).join(fillingCharacter);
    return (pad + number).slice(-pad.length);
  }

  private listen() {
    const self = this;
    this.rws = new ReconnectingWebSocket("ws://127.0.0.1:3000");
    this.rws.onopen = function (event) {
      this.onmessage = (msg) => self.onMessage(msg); //needed for conservation of this pointer
      this.send(JSON.stringify({ type: "subscribe", event: self.rendererUri }));
    }
  }

  private onMessage(msg) {
    const nextData = JSON.parse(msg.data);
    if (nextData.data && "ok" === nextData.status && nextData.type === "data" && nextData.event === this.rendererUri) {
      this.renderer.next(nextData.data);
    }
  }

  private setRendererState(state: "play" | "pause" | "stop") {
    const headers = new HttpHeaders({"content-type": "application/json"});
    this.http.post("http://127.0.0.1:3000" + this.rendererUri, { state }, { headers }).subscribe((resp) => {
      console.log({ state }); 
      console.log(resp);
    });
  }

  public play() {
    this.setRendererState('play');
  }

  public pause() {
    this.setRendererState('pause');
  }

  public stop() {
    this.setRendererState('stop');
  }

  get currentPlayPosition(): string {
    const currentOffset = this.offsetMilliSeconds/1000;
    const seconds = this.paddy((currentOffset % 60), 2, "0");
    const minutes = this.paddy((currentOffset - (currentOffset % 60)) / 60, 2, "0");
    return `${minutes}:${seconds}`;
  }
  get remainingPlayTime(): string {
    const currentOffset = this.offsetMilliSeconds/1000;
    const seconds = this.paddy(((this.totalPlayTime - currentOffset) % 60), 2, "0");
    const minutes = this.paddy(((this.totalPlayTime - currentOffset) - ((this.totalPlayTime - currentOffset) % 60)) / 60, 2, "0");
    return `${minutes}:${seconds}`;
  }
}
