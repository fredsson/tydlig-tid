import { useRef, useState } from "react";
import * as dayjs from 'dayjs'

let startOfLunch: dayjs.Dayjs | undefined;

interface LunchTimeProps {
  onChange(e: number): void; 
}

export default function LunchTime({onChange}: LunchTimeProps) {
  const [lunchTimeInMinutes, setLunchTime] = useState<number | undefined>(undefined);
  const [eatingLunch, setEatingLunch] = useState<boolean>(false);
  const [editingLunchTime, setEditingLunchTime] = useState<boolean>(false);
  const editLunchRef = useRef(0);

  const handleEatingLunch = () => {
    if (lunchTimeInMinutes != undefined) {
      setEditingLunchTime(true);
      return;
    }

    if (!eatingLunch) {
      startOfLunch = dayjs();
    } else {
      const elapsedTime = dayjs().diff(startOfLunch, 'minutes')
      setLunchTime(elapsedTime);
      onChange(elapsedTime);
    }
    setEatingLunch(p => !p);
  };

  const handleLunchTimeChanged = () => {
    setLunchTime(editLunchRef.current);
    onChange(editLunchRef.current);
    setEditingLunchTime(false);
  }

  return (
    <>
      <div className="input-container">
        <label>Lunch (Minutes): {lunchTimeInMinutes ?? '-'}</label>
        <button onClick={handleEatingLunch}>{ lunchTimeInMinutes != undefined ? 'edit' : eatingLunch ? 'Stop' : 'Start Lunch!'}</button>
      </div>
      {editingLunchTime ? <div><input onChange={e => editLunchRef.current = +e.target.value} type="number" /><button onClick={handleLunchTimeChanged}>Confirm</button></div> : ''}
    </>
  );
}