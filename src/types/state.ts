import { Activity, PerformedActivity } from "./activity";

export interface TydligState {
  activities: Activity[];
  timelines: Record<string, PerformedActivity[]>;
}
