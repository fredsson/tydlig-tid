import {Dayjs} from 'dayjs';

export interface Activity {
  id: number;
  name: string;
  color: string;
}

export interface PerformedActivity {
  id: number;
  activity: Activity;
  startTime: Dayjs;
  endTime: Dayjs;
}
