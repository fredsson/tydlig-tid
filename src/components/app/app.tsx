import { useEffect, useState } from 'react';
import {default as createDate, Dayjs} from 'dayjs';
import './app.css'
import StartTime from '../start-time/start-time';
import LunchTime from '../lunch-time/lunch-time';
import BillableProject from '../billable-project/billable-project';

function calculateTotalHoursWorked(startTime: Dayjs | undefined, now: Dayjs, lunchTimeInMinutes: number) {
  if (!startTime) {
    return 0;
  }
  const totalMinutes = now.diff(startTime, 'minutes');
  const totalHoursWithLunch = (totalMinutes - lunchTimeInMinutes) / 60;

  return Math.round(totalHoursWithLunch * 10) / 10;
}

export default function App() {
  const [startTime, setStartTime] = useState<Dayjs | undefined>(undefined);
  const [lunchTimeInMinutes, setLunchTime] = useState<number | undefined>(10);
  const [totalTimeInHours, setTotalTime] = useState<number | undefined>(undefined);
  const [currentProject, setProject] = useState<{name: string} | undefined>(undefined);

  useEffect(() => {
    setTotalTime(calculateTotalHoursWorked(startTime, createDate(), lunchTimeInMinutes ?? 0));
    const timerId = setInterval(() => {
      setTotalTime(calculateTotalHoursWorked(startTime, createDate(), lunchTimeInMinutes ?? 0))
    }, 60 * 1000);

    return () => {
      clearInterval(timerId);
    }
  }, [startTime, lunchTimeInMinutes]);

  return (
    <div className='main-layout'>
      <aside>Test</aside>
      <div>
        <h1>Tydlig Tid</h1>
        <div className='section'>
          <StartTime onChange={setStartTime} disabled={!currentProject} />
        </div>
        <div className='section'>
          <LunchTime onChange={setLunchTime} />
        </div>
        <div className='section'>
          <BillableProject onChange={setProject} />
        </div>
        <div className='section'>
          <div>Total Hours: {totalTimeInHours}</div>
        </div>
      </div>
      <aside>Test 2</aside>
    </div>
  )
}
