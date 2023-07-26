import { TimePicker,  } from "@mui/x-date-pickers";
import { Control, Controller, FieldValues } from "react-hook-form";

export interface FormTimePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: string;
  label: string;
}

const FormTimePicker = ({control, name, label}: FormTimePickerProps<any>) => {

  const handleTimePickerOnChange = (onChange: (value: any) =>void, value: any, context: {validationError: string | null}) => {
    if (context.validationError) {
      onChange(null);
      return;
    }

    onChange(value);
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({field: {onChange, value}}) => (
        <TimePicker
          value={value}
          onChange={(v, c) => handleTimePickerOnChange(onChange, v, c)}
          ampm={false}
          label={label}
        />
      )}
      rules={{
        required: true,
      }}
    />
  );  
}

export default FormTimePicker;
