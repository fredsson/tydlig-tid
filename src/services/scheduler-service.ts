
export class SchedulerService {
  public static nextId = 0;

  private activeSchedulers = new Map<number, NodeJS.Timeout>();

  public runOnceEvery(callback: () => void, intervalInMs: number, runImmediately?: boolean) {
    if (runImmediately) {
      callback();
    }
    const schedulerId = ++SchedulerService.nextId;

    const timeoutId = setTimeout(() => this.run(callback, intervalInMs, schedulerId), intervalInMs);
    this.activeSchedulers.set(schedulerId, timeoutId);

    return () => {
      const currentId = this.activeSchedulers.get(schedulerId);
      clearTimeout(currentId);
    }
  }

  private run(callback: () => void, intervalInMs: number, schedulerId: number) {
    callback();
    const timeoutId = setTimeout(() => this.run(callback, intervalInMs, schedulerId), intervalInMs);
    this.activeSchedulers.set(schedulerId, timeoutId);
  }
}
