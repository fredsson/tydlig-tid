import { Autocomplete, Box, Button, FormHelperText, TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Activity, PerformedActivity } from "../../types/activity";
import {Dayjs} from 'dayjs';

interface AddActivityFormData {
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  activity: Activity | null;
}

interface AddActivityFormProps {
  activities: Activity[];
  onActivityAdded: (entry: PerformedActivity) => void;
}

export default function AddActivityForm({activities, onActivityAdded}: AddActivityFormProps) {
  const {control, handleSubmit, reset } = useForm<AddActivityFormData>({defaultValues: {
    startTime: null,
    endTime: null,
    activity: null,
  }})

  const handleOnSubmit: SubmitHandler<AddActivityFormData> = data => {
    onActivityAdded(data as PerformedActivity);
    reset();
  };

  const handleTimePickerOnChange = (onChange: (value: any) =>void, value: any, validationError: string | null) => {
    if (validationError) {
      onChange(null);
      return;
    }

    onChange(value);
  }

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <Box sx={{display: "flex", flexDirection: 'column', maxWidth: '54rem'}}>
        <Box sx={{mb: '1rem', display: 'flex', columnGap: '1rem'}}>
          <Controller
            name="startTime"
            control={control}
            render={({field: {onChange, value}}) => (
              <TimePicker
                value={value}
                onChange={(value, context) => handleTimePickerOnChange(onChange, value, context.validationError)}
                ampm={false}
                label="Start"
              />
            )}
            rules={{
              required: true,
            }}
          />
          <Controller
            name="endTime"
            control={control}
            render={({field: {onChange, value}}) => (
              <TimePicker
                value={value}
                onChange={(value, context) => handleTimePickerOnChange(onChange, value, context.validationError)}
                ampm={false}
                label="End"
              />
            )}
            rules={{
              required: true,
            }}
          />
          <Box sx={{width: '20rem'}}>
            <Controller
              name="activity"
              control={control}
              render={({field: { onChange, value }, fieldState}) => (
                <>
                  <Autocomplete
                    value={value}
                    onChange={(_, value) => onChange(value)}
                    options={activities}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(params) => params?.name ?? '' }
                    renderInput={(params) => <TextField label="Activity" {...params} />}
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
          </Box>
        </Box>
        <Button sx={{alignSelf: 'end', maxWidth: '10rem'}} type="submit" variant="contained">Add Activity</Button>
      </Box>
    </form>
  );
}
