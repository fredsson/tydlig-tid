import { useEffect, useState } from "react";
import {default as createDate, Dayjs} from 'dayjs';
import TimeInput from "../time-input/time-input";

import styles from './start-time.module.css';

interface StartTimeProps {
  value: Dayjs | undefined;
  disabled: boolean;
  onChange(e: Dayjs | undefined): void
}

export default function StartTime({value, disabled, onChange}: StartTimeProps) {
  const [startTime, setStartTime] = useState<Dayjs | undefined>(undefined);
  const [editingStartTime, setEditingStartTime] = useState(false);


  useEffect(() => {
    setStartTime(value);
  }, [value]);


  const handleStartButtonClicked = () => {
    if (!startTime) {
      const date = createDate();
      setStartTime(date);
      onChange(date);
    } else {
      setEditingStartTime(true);
    }
  };

  
  const handleEditStartTime = (newTime: Dayjs | undefined) => {
    setStartTime(newTime);
    onChange(newTime);
    setEditingStartTime(false);
  }


  return (
    <>
      <div className={styles['start-time__row']}>
        <label>Started: {startTime?.format('HH:mm') ?? value?.format('HH:mm') ?? '-'}</label>
        <button onClick={handleStartButtonClicked} disabled={disabled} className={styles['start-time__edit-btn']}>{startTime == undefined ? 'Start Your Day!': 'Edit'}</button>
      </div>
      { editingStartTime ? <TimeInput onChange={handleEditStartTime} /> : ''}
    </>
  );
}
