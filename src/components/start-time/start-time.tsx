import { useState } from "react";
import * as dayjs from 'dayjs'
import TimeInput from "../time-input/time-input";

interface StartTimeProps {
  onChange(e: dayjs.Dayjs | undefined): void
}

export default function StartTime({onChange}: StartTimeProps) {
  const [startTime, setStartTime] = useState<dayjs.Dayjs | undefined>(undefined);
  const [editingStartTime, setEditingStartTime] = useState(false);
  
  const handleStartButtonClicked = () => {
    if (!startTime) {
      const date = dayjs();
      setStartTime(date);
      onChange(date);
    } else {
      setEditingStartTime(true);
    }
  };

  
  const handleEditStartTime = (newTime: dayjs.Dayjs | undefined) => {
    setStartTime(newTime);
    onChange(newTime);
    setEditingStartTime(false);
  }


  return (
    <>
      <div className="input-container">
        <label>Started: {startTime?.format('HH:mm') ?? '-'}</label>
        <button onClick={handleStartButtonClicked} className='start-btn'>{startTime == undefined ? 'Start Your Day!': 'Edit'}</button>
      </div>
      { editingStartTime ? <TimeInput onChange={handleEditStartTime} /> : ''}
    </>
  );
}