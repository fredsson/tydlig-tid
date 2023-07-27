import { Dayjs } from "dayjs";
import { Activity, PerformedActivity } from "../types/activity";
import { TydligState } from "../types/state";

interface StoredPerformedActivity {
  id: number;
  activityId: number;
  startTime: string;
  endTime: string;
}

interface StoredV1PerformedActivity {
  projectId: number;
  startTime: string;
  endTime: string;
}

interface StoredV1State {
  projects: Activity[];
  timelines: Record<string, StoredV1PerformedActivity[]>;
}

interface StoredV2State {
  activities: Activity[];
  timelines: Record<string, StoredPerformedActivity[]>;
}

export class StateImporter {

  constructor(private dateFactory: (dateTime?: string) => Dayjs) {
  }

  public import(content: string): TydligState {
    const state = JSON.parse(content);

    if (state.activities) {
      return this.importV2State(state);
    }

    return this.importV1State(state);
  }

  private importV1State(state: StoredV1State): TydligState {
    const timelines = Object.entries(state.timelines).reduce((acc, [key, value]) => {
      const transformedTimelines = value.map((v, i) => {
        const activity = state.projects.find((activity) => activity.id === v.projectId);
        if (!activity) {
          throw new Error(`Could not find activity for id ${v.projectId} in state!`);
        }

        return {
          id: i,
          activity,
          startTime: this.dateFactory(`${key}T${v.startTime}`),
          endTime: this.dateFactory(`${key}T${v.endTime}`)
        }
      });

      acc[key] = transformedTimelines;
      return acc;

    }, {} as Record<string, PerformedActivity[]>)

    return {
      activities: state.projects,
      timelines
    };
  }

  private importV2State(state: StoredV2State): TydligState {
    const timelines = Object.entries(state.timelines).reduce((acc, [key, value]) => {
      const transformedTimeline = value.map(v => {
        const activity = state.activities.find(activity => activity.id === v.activityId);
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
    }, {} as Record<string, PerformedActivity[]>);

    return {
      activities: state.activities,
      timelines
    };
  }
}
