import { default as createDate, Dayjs } from "dayjs";
import { useEffect, useState } from "react";

import styles from './on-break.module.css';

interface OnBreakProps {
  onClick: (durationInMinutes: number) => void;
}

let startTime: Dayjs | undefined;
export default function OnBreak({onClick}: OnBreakProps) {
  const [durationInMinutes, setDurationInMinutes] = useState(0);

  useEffect(() => {
    startTime = createDate();
    setDurationInMinutes(0);

    const intervalId = setInterval(() => {
      const duration = createDate().diff(startTime, 'minutes');
      setDurationInMinutes(duration);
    }, 60 * 1000);

    return () => {
      clearInterval(intervalId);
    }
  }, []);

  return (
    <div>
      <div>Current Break:</div>
      <div>{`${durationInMinutes} minutes`}</div>
      <button className={styles['end-break-btn']} onClick={() => onClick(durationInMinutes)}>End Break</button>
    </div>
  );
}
