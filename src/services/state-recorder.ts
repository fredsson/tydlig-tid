import {default as createDate, Dayjs} from 'dayjs';

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
  private currentProject: TimelineEntry | undefined  = undefined;

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

    this.ensureLunchEntry(startTime);

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
    if (!this.currentProject || !this.state) {
      return;
    }
  
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

  public updateLunch(timeInMinutes: number): void {
    if (!this.state) {
      return;
    }
    const lunchProject = this.state.projects.find(p => p.name === 'Lunch');
    if (!lunchProject) {
      return;
    }

    const now = createDate();
    const timeline = this.state.timelines[now.format('YYYY-MM-DD')];
    const lunchEntryIndex = timeline.findIndex(e => e.projectId === lunchProject.id);
    if (!lunchEntryIndex) {
      return;
    }

    const lunchEndTime = createDate().startOf('day').set('hours', 12).add(timeInMinutes, 'minutes');
    timeline[lunchEntryIndex].endTime = lunchEndTime.format('HH:mm');         
    if (timeline[lunchEntryIndex + 1]) {
      timeline[lunchEntryIndex + 1].startTime = lunchEndTime.format('HH:mm');
    }

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

  private ensureLunchEntry(currentTime: Dayjs): void {
    if (!this.state || !this.currentProject) {
      return;
    }

    const lunchTime = createDate().startOf('day').set('hours', 12);
    const lunchProject = this.state?.projects.find(p => p.name === 'Lunch');
    if (!lunchProject) {
      console.error('Couldnt find lunch project');
      return;
    }
    const timeline = this.state.timelines[currentTime.format('YYYY-MM-DD')];
    const hasLunchEntry = timeline.some(e => e.projectId === lunchProject.id);
    const shouldAddLunch = (currentTime.isAfter(lunchTime, 'minutes') || currentTime.isSame(lunchTime, 'minutes')); 
    if (shouldAddLunch && !hasLunchEntry) {
      const lunchStartTime = lunchTime.format('HH:mm')
      this.currentProject.endTime = lunchStartTime;
      timeline.push({
        startTime: lunchStartTime,
        endTime: lunchStartTime,
        projectId: lunchProject.id
      });

      const newProject: TimelineEntry = {
        startTime: lunchStartTime,
        endTime: currentTime.format('HH:mm'),
        projectId: this.currentProject.projectId
      };
      this.currentProject =  newProject;
      timeline.push(newProject);
    } else {
      console.error('not time to add lunch entry', hasLunchEntry, shouldAddLunch);
    }
  }
}
