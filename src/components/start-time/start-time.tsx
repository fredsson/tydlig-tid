import { useState } from "react";
import {default as createDate, Dayjs} from 'dayjs';
import TimeInput from "../time-input/time-input";

interface StartTimeProps {
  disabled: boolean;
  onChange(e: Dayjs | undefined): void
}

export default function StartTime({disabled, onChange}: StartTimeProps) {
  const [startTime, setStartTime] = useState<Dayjs | undefined>(undefined);
  const [editingStartTime, setEditingStartTime] = useState(false);
  
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
      <div className="input-container">
        <label>Started: {startTime?.format('HH:mm') ?? '-'}</label>
        <button onClick={handleStartButtonClicked} disabled={disabled} className='start-btn'>{startTime == undefined ? 'Start Your Day!': 'Edit'}</button>
      </div>
      { editingStartTime ? <TimeInput onChange={handleEditStartTime} /> : ''}
    </>
  );
}