import { useEffect, useState } from 'react';
import * as dayjs from 'dayjs'
import './app.css'
import StartTime from '../start-time/start-time';
import LunchTime from '../lunch-time/lunch-time';

function calculateTotalHoursWorked(startTime: dayjs.Dayjs | undefined, now: dayjs.Dayjs, lunchTimeInMinutes: number) {
  const totalMinutes = now.diff(startTime, 'minutes');
  const totalHoursWithLunch = (totalMinutes - lunchTimeInMinutes) / 60;

  return Math.round(totalHoursWithLunch * 10) / 10;
}

export default function App() {
  const [startTime, setStartTime] = useState<dayjs.Dayjs | undefined>(undefined);
  const [lunchTime, setLunchTime] = useState<number | undefined>(10);
  const [totalTime, setTotalTime] = useState<number | undefined>(undefined);


  useEffect(() => {
    setTotalTime(calculateTotalHoursWorked(startTime, dayjs(), lunchTime ?? 0))
    const timerId = setInterval(() => {
      setTotalTime(calculateTotalHoursWorked(startTime, dayjs(), lunchTime ?? 0))
    }, 60 * 1000);

    return () => {
      clearInterval(timerId);
    }
  }, [startTime, lunchTime]);

  return (
    <>
      <h1>Tydlig Tid</h1>
      <StartTime onChange={setStartTime} />
      <LunchTime onChange={setLunchTime} />
      Total Hours: {totalTime}
      
    </>
  )
}
