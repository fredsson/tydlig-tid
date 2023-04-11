import { useEffect, useState } from 'react';
import * as dayjs from 'dayjs'
import './app.css'
import StartTime from '../start-time/start-time';
import LunchTime from '../lunch-time/lunch-time';
import BillableProject from '../billable-project/billable-project';

function calculateTotalHoursWorked(startTime: dayjs.Dayjs | undefined, now: dayjs.Dayjs, lunchTimeInMinutes: number) {
  if (!startTime) {
    return 0;
  }
  const totalMinutes = now.diff(startTime, 'minutes');
  const totalHoursWithLunch = (totalMinutes - lunchTimeInMinutes) / 60;

  return Math.round(totalHoursWithLunch * 10) / 10;
}

export default function App() {
  const [startTime, setStartTime] = useState<dayjs.Dayjs | undefined>(undefined);
  const [lunchTimeInMinutes, setLunchTime] = useState<number | undefined>(10);
  const [totalTimeInHours, setTotalTime] = useState<number | undefined>(undefined);
  const [currentProject, setProject] = useState<{name: string} | undefined>(undefined);

  useEffect(() => {
    setTotalTime(calculateTotalHoursWorked(startTime, dayjs(), lunchTimeInMinutes ?? 0))
    const timerId = setInterval(() => {
      setTotalTime(calculateTotalHoursWorked(startTime, dayjs(), lunchTimeInMinutes ?? 0))
    }, 60 * 1000);

    return () => {
      clearInterval(timerId);
    }
  }, [startTime, lunchTimeInMinutes]);

  return (
    <>
      <h1>Tydlig Tid</h1>
      <StartTime onChange={setStartTime} />
      <LunchTime onChange={setLunchTime} />
      <BillableProject onChange={setProject} />
      Total Hours: {totalTimeInHours}
      
    </>
  )
}
