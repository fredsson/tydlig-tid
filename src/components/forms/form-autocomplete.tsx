import { Autocomplete, FormHelperText, TextField } from "@mui/material";
import { Control, Controller, FieldValues } from "react-hook-form";
import { Activity } from "../../types/activity";

interface FormAutoCompleteProps<T extends FieldValues> {
  control: Control<T>;
  name: string;
  label: string;
  activities: Activity[];
}

const FormAutocomplete = ({control, name, label, activities}: FormAutoCompleteProps<any>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({field: { onChange, value }, fieldState}) => (
        <>
          <Autocomplete
            value={value}
            onChange={(_, value) => onChange(value)}
            options={activities}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(params) => params?.name ?? '' }
            renderInput={(params) => <TextField label={label} {...params} error={!!fieldState.error} />}
          />
          {fieldState.error ? <FormHelperText error={true}>{fieldState.error.message}</FormHelperText> : ''}
        </>
      )}
      rules={{
        required: true,
        validate: (value) => {
          const found = activities.some(a => a.id === value?.id);
          if (!found) {
            return 'Could not find activity';
          }

          return undefined;
        }
      }}
    />
  );
}

export default FormAutocomplete;
