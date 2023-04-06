import { useState } from "react";
import * as dayjs from 'dayjs';

interface TimeInputProps {
  onChange: (e: dayjs.Dayjs | undefined) => void;
}

export default function TimeInput({onChange}: TimeInputProps) {

  const handleInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':');

    if (!hours || !minutes) {
      onChange(undefined);
      return;
    }

    const inputTime = dayjs().startOf('day')
      .add(+hours, 'hours')
      .add(+minutes, 'minutes');

    onChange(inputTime);
  };

  return (
    <input onChange={e => handleInputChanged(e)} />
  );
}