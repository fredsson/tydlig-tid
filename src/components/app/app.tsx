import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddActivityForm from "../add-activity-form/add-activity-form";
import { Box, Button, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { PerformedActivity } from '../../types/activity';
import { useEffect, useState } from 'react';
import { StateRecorder } from '../../services/state-recorder';
import {default as createDate} from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import EditActivityDialog, { CloseAction } from '../edit-activity-dialog/edit-activity-dialog';

const stateRecorder = new StateRecorder(createDate);

export default function App() {
  const [activities, setActivities] = useState<PerformedActivity[]>([]);
  const [workedHours, setWorkedHours] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<PerformedActivity | null>(null);

  const handleActivityAdded = (entry: PerformedActivity) => {
    const performedActivity = {
      ...entry,
      id: activities.length + 1
    }

    setActivities(v => [...v, performedActivity])
    stateRecorder.record(performedActivity);
  };

  const handleNewDay = () => {
    setActivities(stateRecorder.getTimelineForToday());
  };

  const handleEditClicked = (performedActivity: PerformedActivity) => {
    setEditActivity(performedActivity);
    setEditOpen(true);
  }

  const handleEditClosed = (action?: CloseAction) => {
    if (action && action.editedActivity) {
      const activity = action.editedActivity;
      const copy = activities.slice(0);
      const indexToReplace = copy.findIndex(v => v.id === activity.id);
      copy.splice(indexToReplace, 1, activity);

      setActivities(copy);
      stateRecorder.replaceRecordsForDay(copy);
    } else if (action && action.deletedId) {
      const copy = activities.slice(0);
      const indexToRemove = copy.findIndex(v => v.id === action.deletedId);
      copy.splice(indexToRemove, 1);

      setActivities(copy);
      stateRecorder.replaceRecordsForDay(copy);
    }
    setEditOpen(false);
    setEditActivity(null);
  }

  useEffect(() => {
    setActivities(stateRecorder.getTimelineForToday());
  }, []);

  useEffect(() => {
    const workActivities = activities.filter(v => v.activity.id !== 1);
    const workTimeInMinutes = workActivities
      .map(v => v.endTime.diff(v.startTime, 'minutes'))
      .reduce((acc, v) => acc + v, 0);

    const roundedHours = Math.round((workTimeInMinutes / 60) * 100) / 100;

    setWorkedHours(roundedHours);
  }, [activities]);

  const availableActivities = stateRecorder.getAvailableActivities();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <h1>Tydlig Tid</h1>
      <Box sx={{ my: 3, mx: 2 }}>
        <AddActivityForm activities={availableActivities} onActivityAdded={handleActivityAdded} />
      </Box>
      <Divider variant="middle" />
      <h2>
        Today ({workedHours}h)
        <Button sx={{marginLeft: '2rem'}} variant="contained" onClick={handleNewDay}>New Day</Button>
      </h2>
      <List sx={{maxWidth: '30rem'}}>
        { activities.map((a, index) => (<div key={a.id}>
          {index === 0 ? <Divider /> : ''}
          <ListItem sx={{borderLeft: '1px solid rgba(0,0,0, 0.12)', borderRight: '1px solid rgba(0,0,0, 0.12)'}} key={a.id} dense={true}>
            <ListItemText primary={a.activity.name} secondary={`${a.startTime.format('HH:mm')}-${a.endTime.format('HH:mm')}`} />
            <ListItemIcon onClick={() => handleEditClicked(a)} sx={{justifyContent: 'end'}}><EditIcon /></ListItemIcon>
          </ListItem>
          <Divider />
        </div>)) }
      </List>
      
      {editActivity && <EditActivityDialog open={editOpen} activities={availableActivities} onClose={handleEditClosed} performedActivity={editActivity} ></EditActivityDialog>}
    </LocalizationProvider>
  )
}
