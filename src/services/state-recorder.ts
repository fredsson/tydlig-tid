import { Activity, PerformedActivity } from "../types/activity";
import {Dayjs} from 'dayjs';

interface TydligState {
  activities: Activity[];
  timelines: Record<string, PerformedActivity[]>;
}

interface StoredPerformedActivity {
  id: number;
  activityId: number;
  startTime: string;
  endTime: string;
}

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

  constructor(private dateFactory: (dateTime?: string) => Dayjs) {
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

  private loadStateFromLocalStorage() {
    const storedState = window.localStorage.getItem(StateRecorder.StateKey);
    if (!storedState) {
      return;
    }

    const state = JSON.parse(storedState);

    const timelines = Object.entries<StoredPerformedActivity[]>(state.timelines).reduce<Record<string, PerformedActivity[]>>((acc, [key, value]) => {
      const transformedTimeline: PerformedActivity[] = value.map(v => {
        const activity: Activity | undefined = state.activities.find((activity: Activity) => activity.id === v.activityId);
        if (!activity) {
          throw new Error(`Could not find activity for id ${v.activityId} in state!`);
        }
        return {
          id: v.id,
          activity,
          startTime: this.dateFactory(`${key}T${v.startTime}`),
          endTime: this.dateFactory(`${key}T${v.endTime}`),
        };
      }); 

      acc[key] = transformedTimeline;

      return acc;
    }, {})


    this.state = {
      activities: state.activities,
      timelines
    };
  }

  private saveStateToLocalStorage() {
    const timelines = Object.entries(this.state.timelines).reduce<any>((acc, [key, value]) => {
      const transformedTimelines = value.map(v => ({
        id: v.id,
        activityId: v.activity.id,
        startTime: v.startTime.format('HH:mm'),
        endTime: v.endTime.format('HH:mm')
      }));

      acc[key] = transformedTimelines;

      return acc;
    }, {});
    
    const preparedState = {
      activities: [
        ...this.state.activities
      ],
      timelines
    };
    window.localStorage.setItem(StateRecorder.StateKey, JSON.stringify(preparedState));
  }
}
