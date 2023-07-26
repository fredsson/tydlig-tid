import { Autocomplete, Box, Button, FormHelperText, TextField } from "@mui/material";
import { useForm, SubmitHandler, Controller, } from "react-hook-form";
import { Activity, PerformedActivity } from "../../types/activity";
import {Dayjs} from 'dayjs';
import FormTimePicker from "../forms/form-time-picker";
import FormAutocomplete from "../forms/form-autocomplete";

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

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <Box sx={{display: "flex", flexDirection: 'column', maxWidth: '54rem'}}>
        <Box sx={{mb: '1rem', display: 'flex', columnGap: '1rem'}}>
          <FormTimePicker
            control={control}
            name="startTime"
            label="Start"
          />
          <FormTimePicker
            control={control}
            name="endTime"
            label="End"
          />
          <Box sx={{width: '20rem'}}>
            <FormAutocomplete
              control={control}
              name="activity"
              label="Activity"
              activities={activities}
            />
          </Box>
        </Box>
        <Button sx={{alignSelf: 'end', maxWidth: '10rem'}} type="submit" variant="contained">Add Activity</Button>
      </Box>
    </form>
  );
}
