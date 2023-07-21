import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddActivityForm from "../add-activity-form/add-activity-form";
import { Box, Divider, List, ListItem, ListItemText } from '@mui/material';
import { PerformedActivity } from '../../types/activity';
import { useState } from 'react';

const Activities = [{ id: 1, name: 'Lunch', color: 'red' }, { id: 2, name: 'Break', color: 'orange' }, { id: 3, name: 'Internal', color: '#28a745' }, { id: 4, name: 'Volvo', color: '#c8d4e1' }];

export default function App() {
  const [activities, setActivities] = useState<PerformedActivity[]>([]);

  const handleActivityAdded = (entry: PerformedActivity) => {
    setActivities(v => [...v, entry])
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <h1>Tydlig Tid</h1>
      <Box sx={{ my: 3, mx: 2 }}>
        <AddActivityForm activities={Activities} onActivityAdded={handleActivityAdded} />
      </Box>
      <Divider variant="middle" />
      <h2>Today</h2>
      <List>
        { activities.map((a, index) => (<>
          {index === 0 ? <Divider /> : ''}
          <ListItem dense={true}>
            <ListItemText primary={a.activity.name} secondary={`${a.startTime.format('HH:mm')}-${a.endTime.format('HH:mm')}`} />
          </ListItem>
          <Divider />
        </>)) }
      </List>
    </LocalizationProvider>
  )
}
