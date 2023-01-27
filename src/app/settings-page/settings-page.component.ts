import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmActionDialogComponent } from '../confirm-action-dialog/confirm-action-dialog.component';
import { defaultMidiConfig, MidiConfig } from "../models/MidiConfig";
import { MainPageStore } from '../store/main-page-store';
import {  Subscription, take } from 'rxjs';


interface TopicData {
  name : string;
  title : string;
  pref? : string;
}

const topics : { [ index : string ] : TopicData } = {
  'general' : { name : 'general', title : 'General'  },
  'midi'    : { name : 'midi',    title : 'Midi'     },
}

const topicList = Object.keys(topics);

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit, OnDestroy {

  currentTopic : TopicData = { name : 'bad-link', title : 'bad Link'};
  topicList = topicList;
  topic_data = topics;

  public midi_config : MidiConfig = defaultMidiConfig();
  config_changed = false;


  private subscriptions : Subscription[] = [];

  constructor(
    private activeRoute: ActivatedRoute, 
    private router : Router,
    public dialog: MatDialog, 
    private prefStore : MainPageStore,
  ){

  }

  ngOnInit() {

    this.prefStore.midi_config$.pipe(take(1)).subscribe(
      m => { this.midi_config = { ...m }; }
    );

    const sub = this.activeRoute.params.subscribe((params) => {
      const input_topic = params['topic'];
      let topic = input_topic;

      if (! input_topic || ! topicList.includes(input_topic)) {
        topic = 'general';
      }

      if (topic != this.currentTopic.name) {
        this.currentTopic = topics[topic];
        if (! input_topic) {
          this.router.navigate([topic], {
            relativeTo : this.activeRoute,
          })
        }
      }

    this.subscriptions.push(sub);


    });
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(s => s.unsubscribe() )
  }


  topicChange(newTopic : string) {

    if (topicList.includes(newTopic)) {
      this.currentTopic = topics[newTopic];

      this.router.navigate( ['../' + newTopic], 
        {   relativeTo: this.activeRoute, }
      );

      this.reset_to_prefs();
    }

  }

  anchorClasses(topic : string) {
    return (this.currentTopic.name === topic ? 'activeNavButton' : 'navButton');
  }

  clear_settings() {
    const dia = this.dialog.open(ConfirmActionDialogComponent, {data : "Clearing Saved Preferences"});

    dia.afterClosed().subscribe((data) => {
      if (data) {
        this.prefStore.clear_settings();
      }
    });

  }

  reset_to_defaults() {
    switch(this.currentTopic.name) {
      case 'midi' : 
        this.prefStore.update_midi_config(defaultMidiConfig());
        this.midi_config = defaultMidiConfig();
        break;

      default :
        console.log(`Don't recognize topic ${this.currentTopic.name} to reset`);
        break;
    }
  }

  reset_to_prefs() {

    this.config_changed = false;

    switch(this.currentTopic.name) {
      case 'midi' : 
        this.prefStore.midi_config$.pipe(take(1)).subscribe(
          m => {this.midi_config = { ...m}}
        ) 
        break;

      default :
        console.log(`Don't recognize topic ${this.currentTopic.name} to set`);
        break;
    }
   
  }

  current_config_changed() {
    this.config_changed = true;
  }

  apply_settings() {
    if (! this.config_changed) return;
    switch(this.currentTopic.name) {
      case 'midi' : 
        this.prefStore.update_midi_config(this.midi_config);
        this.config_changed = false;
        break;

      default :
        console.log(`Don't recognize topic ${this.currentTopic.name} to apply`);
        break;
    }
  }

  save_and_close() {
    this.apply_settings();
    this.router.navigate( [''], 
    //{   relativeTo: this.activeRoute, }
  );

  }


}
