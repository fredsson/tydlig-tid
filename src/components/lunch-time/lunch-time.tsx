import { useEffect, useRef, useState } from "react";
import {default as createDate, Dayjs} from 'dayjs';
import styles from './lunch-time.module.css';


let startOfLunch: Dayjs | undefined;

interface LunchTimeProps {
  onChange(e: number): void;
  disabled: boolean;
}

export default function LunchTime({disabled, onChange}: LunchTimeProps) {
  const [lunchTimeInMinutes, setLunchTime] = useState<number | undefined>(undefined);
  const [eatingLunch, setEatingLunch] = useState<boolean>(false);
  const [editingLunchTime, setEditingLunchTime] = useState<boolean>(false);
  const editLunchRef = useRef(0);

  const updateLunchTime = () => {
    const diff = createDate().diff(startOfLunch, 'minutes');
    setLunchTime(diff);
    return diff;
  };

  const canEdit = lunchTimeInMinutes != undefined && !eatingLunch;

  useEffect(() => {
    if (eatingLunch) {
      updateLunchTime();
      console.log('hello?');
      const id = setInterval(() => {
        console.log('hello 2?');

        updateLunchTime();
      }, 60 * 1000);
      return () => {
        return clearInterval(id);
      }
    }

  }, [eatingLunch]);

  const handleEatingLunch = () => {
    if (canEdit) {
      setEditingLunchTime(true);
      return;
    }

    if (!eatingLunch) {
      startOfLunch = createDate();
    } else {
      const elapsedTime = updateLunchTime();
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
        <button disabled={disabled} onClick={handleEatingLunch} className={styles['lunch-time__edit-btn']}>{ canEdit ? 'Edit' : eatingLunch ? 'Stop' : 'Start Lunch!'}</button>
      </div>
      {editingLunchTime ? <div><input onChange={e => editLunchRef.current = +e.target.value} type="number" /><button onClick={handleLunchTimeChanged}>Confirm</button></div> : ''}
    </>
  );
}
