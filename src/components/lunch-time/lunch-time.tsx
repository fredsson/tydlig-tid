import { useRef, useState } from "react";
import {default as createDate, Dayjs} from 'dayjs';
import styles from './lunch-time.module.css';


let startOfLunch: Dayjs | undefined;

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
      startOfLunch = createDate();
    } else {
      const elapsedTime = createDate().diff(startOfLunch, 'minutes')
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
      <div className={styles['lunch-time__row']}>
        <label>Lunch: {lunchTimeInMinutes ?? '-'} (Min)</label>
        <button onClick={handleEatingLunch} className={styles['lunch-time__edit-btn']}>{ lunchTimeInMinutes != undefined ? 'Edit' : eatingLunch ? 'Stop' : 'Start Lunch!'}</button>
      </div>
      {editingLunchTime ? <div><input onChange={e => editLunchRef.current = +e.target.value} type="number" /><button onClick={handleLunchTimeChanged}>Confirm</button></div> : ''}
    </>
  );
}
