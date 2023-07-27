import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import {Dayjs} from 'dayjs';

import { Activity, PerformedActivity } from '../../types/activity';
import { useForm } from 'react-hook-form';
import FormTimePicker from '../forms/form-time-picker';
import { Box, Button } from '@mui/material';
import FormAutocomplete from '../forms/form-autocomplete';

export interface CloseAction {
  editedActivity?: PerformedActivity;
  deletedId?: number;
}

export interface EditActivityDialogProps {
  open: boolean;
  activities: Activity[];
  performedActivity: PerformedActivity;
  onClose: (action?: CloseAction) => void;
}

interface EditActivityForm {
  startTime: Dayjs;
  endTime: Dayjs;
  activity: Activity;
}

const EditActivityDialog = ({open, activities, performedActivity, onClose}: EditActivityDialogProps) => {
  const {control, handleSubmit} = useForm<EditActivityForm>({
    defaultValues: {
      startTime: performedActivity.startTime,
      endTime: performedActivity.endTime,
      activity: performedActivity.activity
    }
  });

  const onHandleSubmit = (data: EditActivityForm) => {
    onClose({
      editedActivity: {
        ...performedActivity,
        startTime: data.startTime,
        endTime: data.endTime,
        activity: data.activity
      }
    });
  };

  const onHandleDelete = () => {
    onClose({
      deletedId: performedActivity.id
    })
  }

  return (
    <Dialog open={open} onClose={() => onClose()}>
      <DialogTitle sx={{display: 'flex', justifyContent: 'space-between'}}>
        Edit Activity - {performedActivity.id}
        <Button sx={{alignSelf: 'end'}} type="button" variant="contained" color="error" onClick={onHandleDelete}>Delete</Button>
      </DialogTitle>
      <Box sx={{padding: '1rem'}}>
        <form onSubmit={handleSubmit(onHandleSubmit)}>
          <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1rem'}}>
            <Box sx={{display: 'flex', columnGap: '1rem', marginBottom: '1rem'}}>
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
            </Box>
            <FormAutocomplete
              control={control}
              name="activity"
              label="Activity"
              activities={activities}
            />
            <Button sx={{alignSelf: 'end'}} type="submit" variant="contained">Save</Button>
          </Box>
        </form>
      </Box>
    </Dialog>
  );
};

export default EditActivityDialog;
