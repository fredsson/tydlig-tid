import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {default as createDate, Dayjs} from 'dayjs';
import './app.css';
import '../../styles/btn.css';
import githubLogo from '../../assets/github-mark.svg';
import StartTime from '../start-time/start-time';
import LunchTime from '../lunch-time/lunch-time';
import BillableProject from '../billable-project/billable-project';
import { StateRecorder } from '../../services/state-recorder';
import Timeline from '../timeline/timeline';
import TakeBreak from '../break/take-break/take-break';
import OnBreak from '../break/on-break/on-break';

function calculateTotalHoursWorked(startTime: Dayjs | undefined, now: Dayjs, lunchTimeInMinutes: number) {
  if (!startTime) {
    return 0;
  }
  const totalMinutes = now.diff(startTime, 'minutes');
  const totalHoursWithLunch = (totalMinutes - lunchTimeInMinutes) / 60;

  return Math.round(totalHoursWithLunch * 10) / 10;
}

const stateRecorder = new StateRecorder(localStorage, createDate);

export default function App() {
  const [startTime, setStartTime] = useState<Dayjs | undefined>(undefined);
  const [dayEnded, setDayEnded] = useState(false);
  const [lunchTimeInMinutes, setLunchTime] = useState<number | undefined>(undefined);
  const [totalTimeInHours, setTotalTime] = useState<number | undefined>(undefined);
  const [currentProject, setProject] = useState<{name: string, id: number} | undefined>(undefined);
  const [minutesSinceLastBreak, setMinutesSinceLastBreak] = useState<number | undefined>(undefined);

  const [onBreak, setOnBreak] = useState(false);

  const importRef = useRef<any | undefined>(undefined);

  useEffect(() => {
    if (dayEnded) {
      return;
    }
    const timerId = setInterval(() => {
      const currentTime = createDate();
      stateRecorder.updateCurrentProject(currentTime);
      setTotalTime(calculateTotalHoursWorked(startTime, currentTime, lunchTimeInMinutes ?? 0)); 
    }, 60 * 1000);

    return () => {
      clearInterval(timerId);
    }
  }, [startTime, lunchTimeInMinutes, dayEnded]);

  const handleStartDay = (time: Dayjs) => {
    if (currentProject) {
      if (!startTime) {
        stateRecorder.startDay(currentProject.id, time);
      } else {
        stateRecorder.changeStartTime(time);
      }
    }
    setStartTime(time);
    setTotalTime(calculateTotalHoursWorked(startTime, createDate(), lunchTimeInMinutes ?? 0));
  };

  const handleDayEnded = () => {
    setTotalTime(calculateTotalHoursWorked(startTime, createDate(), lunchTimeInMinutes ?? 0)); 
    setDayEnded(p => !p);
  };

  const handleLunchTimeChanged = (lunchTimeInMinutes: number) => {
    setLunchTime(lunchTimeInMinutes);
    stateRecorder.updateLunch(lunchTimeInMinutes);
    setTotalTime(calculateTotalHoursWorked(startTime, createDate(), lunchTimeInMinutes ?? 0));
  };

  const handleProjectChanged = (project: {name: string, id: number}) => {
    if (startTime) {
      stateRecorder.changeProject(project.id, createDate());
    }
    setProject(project);
  };

  const handleTakeBreak = () => {
    setOnBreak(true);
    stateRecorder.addBreak(createDate());
  };

  const handleEndBreak = (durationInMinutes: number) => {
    setOnBreak(false);
    setMinutesSinceLastBreak(0);
    stateRecorder.endBreak(durationInMinutes);
  }

  const handleExport = () => {
    stateRecorder.exportToFile();
  };

  const updateTodayState = () => {
    const today = stateRecorder.today();
    if (today) {
      setProject(today.currentProject);
      handleStartDay(today.startTime);
      if (today.lunchTimeInMinutes) {
        setLunchTime(today.lunchTimeInMinutes);
      }
      setTotalTime(calculateTotalHoursWorked(today.startTime, createDate(), today.lunchTimeInMinutes ?? 0));
      setMinutesSinceLastBreak(today.minutesSinceLastBreak);
    } else {
      setProject(undefined);
      setDayEnded(false);
      setLunchTime(undefined);
      setTotalTime(undefined);
      setMinutesSinceLastBreak(undefined);
    }
  };

  const handleImportStateFile = (ev: ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files;
    if (!files || files.length > 1) {
      return;
    }

    files[0].text().then(content => {
      stateRecorder.importFromFile(content);
      importRef.current.value = "";
    });

    updateTodayState();
  }

  useEffect(() => {
    updateTodayState();
  }, []);

  const timelineToday = stateRecorder.timelineForToday();

  return (
    <>
      <div className='tools-container'>
        <label className='state-btn state-btn__label'>
          Import
          <input ref={importRef} className='state-import__input' type='file' accept='.json' title='Import' multiple={false} onChange={handleImportStateFile}/>
        </label>
        <button className='state-btn' onClick={handleExport}>Export</button>
        <button className='state-btn' onClick={updateTodayState}>Refresh</button>
        <a className='github-link' href="https://github.com/fredsson/tydlig-tid" target='_blank'><img className='github-link__icon' src={githubLogo} /></a>
      </div>
      <div className='main-layout'>
        { timelineToday ? <Timeline value={timelineToday} /> : ''}
        <div>
          <h1>Tydlig Tid</h1>
          <div className='section'>
            <StartTime value={startTime} onChange={handleStartDay} disabled={!currentProject} />
          </div>
          <div className='section'>
            <LunchTime value={lunchTimeInMinutes} disabled={!currentProject} onChange={handleLunchTimeChanged} onLunchStarted={() => stateRecorder.addLunch()} />
          </div>
          <div className='section'>
            <BillableProject existingProjects={stateRecorder.availableProjects()} value={currentProject} onChange={handleProjectChanged} />
          </div>
          <div className='section'>
            <div>Total Hours: {totalTimeInHours}</div>
            <button className='state-btn' onClick={handleDayEnded}>{dayEnded ? 'Continue' : 'End the Day'}</button>
          </div>
        </div>
        <aside className="break-sidebar">
          { !onBreak ? <TakeBreak value={minutesSinceLastBreak} onClick={handleTakeBreak} />  : <OnBreak onClick={handleEndBreak} /> }
        </aside>
      </div>
    </>
  )
}
