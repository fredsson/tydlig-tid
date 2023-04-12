import { useEffect, useState } from 'react';
import {default as createDate, Dayjs} from 'dayjs';
import './app.css'
import StartTime from '../start-time/start-time';
import LunchTime from '../lunch-time/lunch-time';
import BillableProject from '../billable-project/billable-project';
import { StateRecorder } from '../../services/state-recorder';

// TODO this needs to be generated when using tydlig-tid and stored in localstorage (possible to download/load as well)
const projectEntries = [
  {startTime: createDate('2023-04-11T08:40'), endTime: createDate('2023-04-11T12:00'), project: {name: 'Internal'}},
  {startTime: createDate('2023-04-11T12:00'), endTime: createDate('2023-04-11T13:00'), project: {name: 'Lunch'}},
  {startTime: createDate('2023-04-11T13:00'), endTime: createDate('2023-04-11T15:00'), project: {name: 'Volvo'}},
  {startTime: createDate('2023-04-11T15:00'), endTime: createDate('2023-04-11T18:00'), project: {name: 'Internal'}},
];

const lunchEntry = projectEntries.find(v => v.project.name === 'Lunch');

const beforeLunch = projectEntries.filter(b => b.startTime.isBefore(lunchEntry?.startTime));
const afterLunch = projectEntries.filter(b => b.startTime.isAfter(lunchEntry?.startTime));

const totalBeforeLunch = 4 * 60;
const totalAfterLunch = afterLunch.reduce((prev, cur) => prev + cur.endTime.diff(cur.startTime, 'minutes'), 0);

const colorsByProject: Record<string, string> = {
  'Internal': '#28a745',
  'Volvo': '#c8d4e1',
  'Lunch': 'red',
};

function calculateTotalHoursWorked(startTime: Dayjs | undefined, now: Dayjs, lunchTimeInMinutes: number) {
  if (!startTime) {
    return 0;
  }
  const totalMinutes = now.diff(startTime, 'minutes');
  const totalHoursWithLunch = (totalMinutes - lunchTimeInMinutes) / 60;

  return Math.round(totalHoursWithLunch * 10) / 10;
}

const stateRecorder = new StateRecorder();

export default function App() {
  const [startTime, setStartTime] = useState<Dayjs | undefined>(undefined);
  const [lunchTimeInMinutes, setLunchTime] = useState<number | undefined>(10);
  const [totalTimeInHours, setTotalTime] = useState<number | undefined>(undefined);
  const [currentProject, setProject] = useState<{name: string, id: number} | undefined>(undefined);

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

  return (
    <div className='main-layout'>
      <aside>
        <div>Timeline</div>
        <div className='timeline'>
          <div className='timeline__legend'>
            <div className='legend__item'><div style={{width: '5px', height: '5px', backgroundColor: colorsByProject['Lunch']}} />Lunch</div>
            <div className='legend__item'><div style={{width: '5px', height: '5px', backgroundColor: colorsByProject['Internal']}} />Internal</div>
            <div className='legend__item'><div style={{width: '5px', height: '5px', backgroundColor: colorsByProject['Volvo']}} />Volvo</div>
          </div>
          <div className='timeline__content'>
            <div style={{height: '47%', display: 'flex', flexDirection: 'column', justifyContent: 'end'}}>{beforeLunch.map((b, i) => <div key={i} style={{height: `${(b.endTime.diff(b.startTime, 'minutes') / totalBeforeLunch) * 100}%`, backgroundColor: colorsByProject[b.project.name]}}></div>)}</div>
            <div style={{height: '6%', backgroundColor: 'red'}}></div>
            <div style={{height: '47%'}}>{afterLunch.map((b, i) => <div key={i} style={{height: `${(b.endTime.diff(b.startTime, 'minutes') / totalAfterLunch) * 100}%`, backgroundColor: colorsByProject[b.project.name]}}></div>)}</div>
          </div>
        </div>
      </aside>
      <div>
        <h1>Tydlig Tid</h1>
        <div className='section'>
          <StartTime onChange={handleStartDay} disabled={!currentProject} />
        </div>
        <div className='section'>
          <LunchTime onChange={handleLunchTimeChanged} />
        </div>
        <div className='section'>
          <BillableProject onChange={handleProjectChanged} />
        </div>
        <div className='section'>
          <div>Total Hours: {totalTimeInHours}</div>
        </div>
      </div>
      <aside>Test 2</aside>
    </div>
  )
}
