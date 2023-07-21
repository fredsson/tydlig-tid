import {Dayjs} from 'dayjs';

export interface Activity {
  id: number;
  name: string;
  color: string;
}

export interface PerformedActivity {
  activity: Activity;
  startTime: Dayjs;
  endTime: Dayjs;
}
