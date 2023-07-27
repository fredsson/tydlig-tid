import { Activity, PerformedActivity } from "../types/activity";
import {Dayjs} from 'dayjs';
import { TydligState } from "../types/state";
import { StateImporter } from "./state-importer";





export class StateRecorder {
  private static StateKey = 'TYDLIG_TID_STATE';

  private state: TydligState = {
    activities: [
      {color: 'red', name: 'Lunch', id: 1},
      {color: 'orange', name: 'Break', id: 2},
      {color: '#28a745', name: 'Internal', id: 3},
    ],
    timelines: {}
  };

  private stateImporter: StateImporter;

  constructor(private dateFactory: (dateTime?: string) => Dayjs) {
    this.stateImporter = new StateImporter(dateFactory);
    this.loadStateFromLocalStorage();
  }

  public record(activity: PerformedActivity) {
    const todayDateString = this.dateFactory().format('YYYY-MM-DD');
    if (!this.state.timelines[todayDateString]) {
      this.state.timelines[todayDateString] = [];
    }

    this.state.timelines[todayDateString].push(activity);

    this.saveStateToLocalStorage();
  }

  public replaceRecordsForDay(activities: PerformedActivity[]) {
    const todayDateString = this.dateFactory().format('YYYY-MM-DD');
    if (!this.state.timelines[todayDateString]) {
      return;
    }

    this.state.timelines[todayDateString] = activities;

    this.saveStateToLocalStorage();
  }

  public getAvailableActivities(): Activity[] {
    return this.state.activities;
  }

  public getTimelineForToday(): PerformedActivity[] {
    const todayDateString = this.dateFactory().format('YYYY-MM-DD');
    const timeline = this.state.timelines[todayDateString];
    if (!timeline) {
      return [];
    }

    return timeline;
  }

  public importFromFile(fileContent: string): void {
    const importedState = this.stateImporter.import(fileContent);

    this.state.activities = Array.from(this.state.activities.concat(importedState.activities).reduce((acc, value) => {
      acc.set(value.id, value);

      return acc;
    }, new Map<number, Activity>()).values());

    Object.entries(importedState.timelines).forEach(([key, timeline]) => {
      if (!this.state.timelines[key]) {
        this.state.timelines[key] = timeline;
      }
    });

    this.saveStateToLocalStorage();
  }

  public exportToFile(): void {
    const link = document.createElement('a');
    
    const preparedState = {
      activities: [
        ...this.state.activities
      ],
      timelines: this.transformTimelineForStorage(this.state.timelines)
    };

    const file = new Blob([JSON.stringify(preparedState)], {type: 'application/json'});
    link.href = URL.createObjectURL(file);

    link.download = 'tydlig-tid-state.json';

    link.click();

    URL.revokeObjectURL(link.href);
  }

  private loadStateFromLocalStorage() {
    const storedState = window.localStorage.getItem(StateRecorder.StateKey);
    if (!storedState) {
      return;
    }

    this.state = this.stateImporter.import(storedState);
  }

  private saveStateToLocalStorage() {
    const timelines = this.transformTimelineForStorage(this.state.timelines);
    
    const preparedState = {
      activities: [
        ...this.state.activities
      ],
      timelines
    };
    window.localStorage.setItem(StateRecorder.StateKey, JSON.stringify(preparedState));
  }

  private transformTimelineForStorage(timelines: Record<string, PerformedActivity[]>) {
    return Object.entries(timelines).reduce<any>((acc, [key, value]) => {
      const transformedTimelines = value.map(v => ({
        id: v.id,
        activityId: v.activity.id,
        startTime: v.startTime.format('HH:mm'),
        endTime: v.endTime.format('HH:mm')
      }));

      acc[key] = transformedTimelines;

      return acc;
    }, {});
  }
}
