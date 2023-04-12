import { Dayjs } from "dayjs";


const LOCALSTORAGE_KEY = "tydlig_tid_data";

interface TimelineEntry {
  startTime: string;
  endTime: string;
  projectId: number;
}

interface AppState {
  projects: {
    color: string;
    id: number;
    name: string;
  }[],
  timelines: Record<string, TimelineEntry[]>;
}

export class StateRecorder {

  private state: AppState | undefined = undefined;
  private currentProject: TimelineEntry | undefined  = undefined

  constructor() {
    this.load();
  }

  public startDay(projectId: number, startTime: Dayjs) {
    if (!this.state) {
      return;
    }
    this.currentProject = {
      startTime: startTime.format('HH:mm'),
      endTime: startTime.format('HH:mm'),
      projectId
    };
    this.state.timelines[startTime.format('YYYY-MM-DD')] = [
      this.currentProject
    ];

    this.save();
  }

  public changeStartTime(startTime: Dayjs) {
    if (!this.state) {
      return;
    }
    const timeline = this.state.timelines[startTime.format('YYYY-MM-DD')];
    timeline[0].startTime = startTime.format('HH:mm');

    this.save();
  }

  public updateCurrentProject(currentTime: Dayjs) {
    if (this.currentProject) {
      this.currentProject.endTime = currentTime.format('HH:mm'); 
    }
    this.save();
  }

  public changeProject(projectId: number, startTime: Dayjs) {
    if (!this.state) {
      return;
    }
    if (this.currentProject) {
      this.currentProject.endTime = startTime.format('HH:mm');
    }

    const entry: TimelineEntry = {
      startTime: startTime.format('HH:mm'),
      endTime: startTime.format('HH:mm'),
      projectId
    };
    this.state.timelines[startTime.format('YYYY-MM-DD')].push(entry);
    this.currentProject = entry;

    this.save();
  }
  private save(): void {
    if (this.state) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(this.state));
    }
  }

  private load(): void {
    const data = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!data) {
      this.state = {
        projects: [],
        timelines: {}
      };
      return;
    }

    this.state = JSON.parse(data);
  }
}
