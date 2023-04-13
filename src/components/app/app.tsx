import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {default as createDate, Dayjs} from 'dayjs';
import './app.css'
import StartTime from '../start-time/start-time';
import LunchTime from '../lunch-time/lunch-time';
import BillableProject from '../billable-project/billable-project';
import { StateRecorder } from '../../services/state-recorder';

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
  const [lunchTimeInMinutes, setLunchTime] = useState<number | undefined>(undefined);
  const [totalTimeInHours, setTotalTime] = useState<number | undefined>(undefined);
  const [currentProject, setProject] = useState<{name: string, id: number} | undefined>(undefined);

  const importRef = useRef<any | undefined>(undefined);

  useEffect(() => {
    setTotalTime(calculateTotalHoursWorked(startTime, createDate(), lunchTimeInMinutes ?? 0));
    const timerId = setInterval(() => {
      const currentTime = createDate();
      stateRecorder.updateCurrentProject(currentTime);
      setTotalTime(calculateTotalHoursWorked(startTime, currentTime, lunchTimeInMinutes ?? 0)); 
    }, 60 * 1000);

    return () => {
      clearInterval(timerId);
    }
  }, [startTime, lunchTimeInMinutes]);

  const handleStartDay = (time: Dayjs) => {
    if (currentProject) {
      if (!startTime) {
        stateRecorder.startDay(currentProject.id, time);
      } else {
        stateRecorder.changeStartTime(time);
      }
    }
    setStartTime(time);
  };

  const handleLunchTimeChanged = (lunchTimeInMinutes: number) => {
    setLunchTime(lunchTimeInMinutes);
    stateRecorder.updateLunch(lunchTimeInMinutes);
  };

  const handleProjectChanged = (project: {name: string, id: number}) => {
    if (startTime) {
      stateRecorder.changeProject(project.id, createDate());
    }
    setProject(project);
  };

  const handleExport = () => {
    stateRecorder.exportToFile();
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

    const today = stateRecorder.today();
    if (today) {
      setProject(today.currentProject);
      handleStartDay(today.startTime);
      if (today.lunchTimeInMinutes) {
        setLunchTime(today.lunchTimeInMinutes);
      }
    }
  }

  useEffect(() => {
    const today = stateRecorder.today();
    if (today) {
      setProject(today.currentProject);
      handleStartDay(today.startTime);
      if (today.lunchTimeInMinutes) {
        setLunchTime(today.lunchTimeInMinutes);
      }
    }
  }, []);

  const timelineToday = stateRecorder.timelineForToday();

  return (
    <>
      <div>
        <label className='state-import__label state-btn'>
          Import
          <input ref={importRef} className='state-import__input' type='file' accept='.json' title='Import' multiple={false} onChange={handleImportStateFile}/>
        </label>
        <button className='state-btn' onClick={handleExport}>Export</button>
      </div>
      <div className='main-layout'>
        { timelineToday ? <aside>
          <div>Timeline</div>
          <div className='timeline'>
            <div className='timeline__legend'>
              { Object.entries(timelineToday.legend).map(([name, color]) => <div key={name} className='legend__item'><div style={{width: '5px', height: '5px', backgroundColor: color}}></div>{name}</div>) }
            </div>
            <div className='timeline__content'>
              <div className='timeline__before-lunch'>{timelineToday.timeline.beforeLunch.map((e, i) => <div key={i} style={{height: `${e.percentage}%`, backgroundColor: e.color}}></div>)}</div>
              <div style={{height: '6%', backgroundColor: 'red'}}></div>
              <div style={{height: '47%'}}>{ timelineToday.timeline.afterLunch.map((e, i) => <div key={i} style={{height: `${e.percentage}%`, backgroundColor: e.color}}></div>)}</div>
            </div>
          </div>
        </aside>
        : ''}
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
          </div>
        </div>
        <aside>Test 2</aside>
      </div>
    </>
  )
}
