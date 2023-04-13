import { Dayjs } from 'dayjs';

const LOCALSTORAGE_KEY = "tydlig_tid_data";

export interface RecorderStorage {
  getItem(key: string): string | null;
  setItem(key: string, content: string): void;
}

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

interface TodayState {
  startTime: Dayjs;
  lunchTimeInMinutes?: number;
  currentProject: {name: string, id: number};
}

export class StateRecorder {

  private state: AppState;
  private currentProject: TimelineEntry | undefined  = undefined;

  constructor(private storage: RecorderStorage, private createDate: (date?: string) => Dayjs) {
    const data = this.storage.getItem(LOCALSTORAGE_KEY);
    if (!data) {
      this.state = {
        projects: [{name: 'Lunch', id: 1, color: 'red'}, {name: 'Break', id: 2, color: 'yellow'}],
        timelines: {}
      };
      return;
    } else {
      this.state = JSON.parse(data);
    }
    const timeline = this.state.timelines[this.createDate().format('YYYY-MM-DD')];
    if (timeline && timeline.length) {
      this.currentProject = timeline[timeline.length - 1];
    }
  }

  public startDay(projectId: number, startTime: Dayjs) {
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

  public addLunch(): void {
    if (!this.currentProject) {
      return;
    }

    const lunchProject = this.state.projects.find(p => p.name === 'Lunch');
    if (!lunchProject) {
      return;
    }
    const timeline = this.state.timelines[this.createDate().format('YYYY-MM-DD')];
    const hasLunchEntry = timeline.some(e => e.projectId === lunchProject.id);
    if (hasLunchEntry) {
      return;
    }

    const nextProject = {
      ...this.currentProject
    };

    this.currentProject.endTime = '12:00';
    timeline.push({
      startTime: '12:00',
      endTime: '12:00',
      projectId: lunchProject.id,
    });
    nextProject.startTime = '12:00';
    nextProject.endTime = '12:00';

    timeline.push(nextProject);
    this.currentProject = nextProject;

    this.save();
  }

  public updateLunch(timeInMinutes: number): void {
    const lunchProject = this.state.projects.find(p => p.name === 'Lunch');
    if (!lunchProject) {
      return;
    }

    const now = this.createDate();
    const timeline = this.state.timelines[now.format('YYYY-MM-DD')];
    const lunchEntryIndex = timeline.findIndex(e => e.projectId === lunchProject.id);
    if (!lunchEntryIndex) {
      return;
    }

    const lunchEndTime = this.createDate().startOf('day').set('hours', 12).add(timeInMinutes, 'minutes');
    timeline[lunchEntryIndex].endTime = lunchEndTime.format('HH:mm');         
    if (timeline[lunchEntryIndex + 1]) {
      timeline[lunchEntryIndex + 1].startTime = lunchEndTime.format('HH:mm');
    }

    this.save();
  }

  public exportToFile(): void {
    const link = document.createElement('a');
    const content = JSON.stringify(this.state);

    const file = new Blob([content], {type: 'application/json'});
    link.href = URL.createObjectURL(file);

    link.download = 'tydlig-tid-data.json';

    link.click();

    URL.revokeObjectURL(link.href);
  }

  public importFromFile(fileContent: string): void {
    this.state = JSON.parse(fileContent);

    const timeline = this.state.timelines[this.createDate().format('YYYY-MM-DD')];
    if (timeline && timeline.length) {
      this.currentProject = timeline[timeline.length - 1];
    }

    this.save();
  }

  public today(): TodayState | undefined {
    const dateToday = this.createDate().format('YYYY-MM-DD');

    const timeline = this.state?.timelines[dateToday];
    if (!timeline) {
      return undefined;
    }



    const startTime = this.createDate(`${dateToday}T${timeline[0].startTime}`);

    const lunchProject = this.state?.projects.find(p => p.name === 'Lunch');
    const lunchEntry = timeline.find(e => e.projectId === lunchProject?.id);


    const lunchTimeInMinutes = lunchEntry ? this.createDate(`${dateToday}T${lunchEntry.endTime}`).diff(this.createDate(`${dateToday}T${lunchEntry.startTime}`), 'minutes') : 0;

    const currentProjectEntry = timeline[timeline.length - 1];
    const project = this.state.projects.find(p => p.id === currentProjectEntry.projectId);

    return {
      startTime,
      lunchTimeInMinutes,
      currentProject: project!,
    };

  }

  public timelineForToday() {
    const dateToday = this.createDate().format('YYYY-MM-DD');
    const timeline = this.state.timelines[dateToday];
    if (!timeline) {
      return undefined;
    }

    const lunchProject = this.state?.projects.find(p => p.name === 'Lunch');
    if (!lunchProject) {
      return undefined;
    }

    const entries = timeline.map(e => {
      const project = this.state.projects.find(p => p.id === e.projectId);
      return {
        startTime: this.createDate(`${dateToday}T${e.startTime}`),
        endTime: this.createDate(`${dateToday}T${e.endTime}`),
        id: e.projectId,
        name: project?.name ?? '?',
        color: project?.color ?? 'hotpink'
      };
    });

    const legend = entries.reduce<Record<string,string>>((total, e) => {
      total[e.name] = e.color;
      return total;
    }, {});

    const lunchEntry = entries.find(e => e.id === lunchProject.id);
    const entriesBeforeLunch = entries.filter(b => b.startTime.isBefore(lunchEntry?.startTime));
    const entriesAfterLunch = entries.filter(b => b.startTime.isAfter(lunchEntry?.startTime));

    const totalMinutesBeforeLunch = 4 * 60;
    const totalMinutesAfterLunch = entriesAfterLunch.reduce((prev, cur) => prev + cur.endTime.diff(cur.startTime, 'minutes'), 0);

    return {
      legend,
      timeline: {
        beforeLunch: entriesBeforeLunch.map(e => ({
          percentage: (e.endTime.diff(e.startTime, 'minutes') / totalMinutesBeforeLunch) * 100,
          color: e.color
        })),
        afterLunch: entriesAfterLunch.map(e => ({
          percentage: (e.endTime.diff(e.startTime, 'minutes') / totalMinutesAfterLunch) * 100,
          color: e.color
        }))
      }
    }
  }

  public availableProjects(): {id: number, name: string}[] {
    return this.state.projects.filter(p => p.name !== 'Lunch' && p.name !== 'Break');
  }

  private save(): void {
    this.storage.setItem(LOCALSTORAGE_KEY, JSON.stringify(this.state));
  }
}
