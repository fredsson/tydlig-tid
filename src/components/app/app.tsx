import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddActivityForm from "../add-activity-form/add-activity-form";
import { Box, Button, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { PerformedActivity } from '../../types/activity';
import { useEffect, useState } from 'react';
import { StateRecorder } from '../../services/state-recorder';
import {default as createDate} from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';

const stateRecorder = new StateRecorder(createDate);

export default function App() {
  const [activities, setActivities] = useState<PerformedActivity[]>([]);
  const [workedHours, setWorkedHours] = useState(0);

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

  useEffect(() => {
    setActivities(stateRecorder.getTimelineForToday());
  }, []);

  useEffect(() => {
    const workActivities = activities.filter(v => ![1,2].includes(v.activity.id));
    const workTimeInMinutes = workActivities
      .map(v => v.endTime.diff(v.startTime, 'minutes'))
      .reduce((acc, v) => acc + v, 0);

    const roundedHours = Math.round((workTimeInMinutes / 60) * 100) / 100;

    setWorkedHours(roundedHours);
  }, [activities]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <h1>Tydlig Tid</h1>
      <Box sx={{ my: 3, mx: 2 }}>
        <AddActivityForm activities={stateRecorder.getAvailableActivities()} onActivityAdded={handleActivityAdded} />
      </Box>
      <Divider variant="middle" />
      <h2>Today ({workedHours}h)</h2>
      <List sx={{maxWidth: '30rem'}}>
        { activities.map((a, index) => (<div key={a.id}>
          {index === 0 ? <Divider /> : ''}
          <ListItem sx={{borderLeft: '1px solid rgba(0,0,0, 0.12)', borderRight: '1px solid rgba(0,0,0, 0.12)'}} key={a.id} dense={true}>
            <ListItemText primary={a.activity.name} secondary={`${a.startTime.format('HH:mm')}-${a.endTime.format('HH:mm')}`} />
            <ListItemIcon sx={{justifyContent: 'end'}}><EditIcon /></ListItemIcon>
          </ListItem>
          <Divider />
        </div>)) }
      </List>
      <Button variant="contained" onClick={handleNewDay}>New Day</Button>
    </LocalizationProvider>
  )
}
