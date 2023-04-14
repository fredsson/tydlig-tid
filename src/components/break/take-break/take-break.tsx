import { default as createDate, Dayjs } from "dayjs";
import { useEffect, useState } from "react";

import styles from './take-break.module.css';

interface TakeBreakProps {
  value: number | undefined;
  onClick: () => void;
}

function classFromTimeSinceBreak(minutesSinceBreak: number): string {
  if (minutesSinceBreak >= 60) {
    return 'break-container--danger';
  }
  if (minutesSinceBreak >= 30) {
    return 'break-container--warn';
  }
  return 'break-container--success';
}

let startTime: Dayjs | undefined;
export default function TakeBreak({value, onClick}: TakeBreakProps) {
  const [minutesSinceBreak, setMinutesSinceBreak] = useState<number>(0);

  useEffect(() => {
    if (value) {
      setMinutesSinceBreak(value);
    }
  }, [value]);

  useEffect(() => {
    startTime = createDate();
    setMinutesSinceBreak(0);

    const intervalId = setInterval(() => {
      const minutesPassed = createDate().diff(startTime, 'minutes');
      setMinutesSinceBreak(minutesPassed);
    }, 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={`${styles['break-container']} ${styles[classFromTimeSinceBreak(minutesSinceBreak)]}`}>
      <div>{minutesSinceBreak} (min)</div>
      <div>since last break</div>
      <button className={styles['break-btn']} onClick={onClick}>Take break</button>
    </div>
  )
}
