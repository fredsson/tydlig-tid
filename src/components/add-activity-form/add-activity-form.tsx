import { Box, Button } from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { Activity, PerformedActivity } from "../../types/activity";
import { Dayjs } from 'dayjs';
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
      <Box sx={{display: "grid", gridTemplateColumns: '18rem 18rem 20rem', gridTemplateRows: '1fr 1fr', gap: '1rem', justifyContent: 'center'}}>
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
        <FormAutocomplete
          control={control}
          name="activity"
          label="Activity"
          activities={activities}
        />
        <Button sx={{ gridColumn: 3, justifySelf: 'end', alignSelf: 'center' }} type="submit" variant="contained">Add Activity</Button>
      </Box>
    </form>
  );
}
