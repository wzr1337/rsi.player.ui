import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { PlayerProvider } from '../../providers/player/player';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Slides) slides: Slides;

  constructor(public navCtrl: NavController, public player:PlayerProvider) {
  }

  public togglePlay() {
    if(this.player.isPlaying) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  get offset():number {
    return Math.min(this.player.offsetMilliSeconds / (this.player.totalPlayTime * 1000) * 100, 100);
  }

  public slideChanged() {
    console.log("track changed to", this.slides.getActiveIndex());
  }

  public next() {
    this.slides.slideNext();
  }

  public prev() {
    this.slides.slidePrev();
  }

}
