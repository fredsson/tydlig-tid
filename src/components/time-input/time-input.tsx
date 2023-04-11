import { useState } from "react";
import {default as createDate, Dayjs} from 'dayjs';


interface TimeInputProps {
  onChange: (e: Dayjs) => void;
}

export default function TimeInput({onChange}: TimeInputProps) {
  const [value, setValue] = useState<{time: Dayjs | undefined, valid: boolean}>({time: undefined, valid: false});

  const handleInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':');

    if (!hours || !minutes) {
      setValue({time: undefined, valid: false});
      return;
    }

    const inputTime = createDate().startOf('day')
      .add(+hours, 'hours')
      .add(+minutes, 'minutes');

    setValue({time: inputTime, valid: inputTime.isValid()});
  };

  const handleOnClick = () => {
    if (value.valid && value.time) {
      onChange(value.time);
    }
  };

  return (
    <>
      <input onChange={e => handleInputChanged(e)} />
      <button disabled={!value.valid} onClick={handleOnClick}>Confirm</button>
    </>
  );
}