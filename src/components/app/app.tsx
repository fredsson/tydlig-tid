import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddActivityForm from "../add-activity-form/add-activity-form";
import { Box, Button, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip, Typography, Link } from '@mui/material';
import { PerformedActivity } from '../../types/activity';
import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { StateRecorder } from '../../services/state-recorder';
import { default as createDate } from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import EditActivityDialog, { CloseAction } from '../edit-activity-dialog/edit-activity-dialog';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import GitHubIcon from '@mui/icons-material/GitHub';
import { SchedulerService } from '../../services/scheduler-service';

const stateRecorder = new StateRecorder(createDate);
const schedulerService = new SchedulerService();

function colorBasedOnTimeSinceBreak(minutesSinceLastBreak: number) {
  if (minutesSinceLastBreak < 30) {
    return 'auto';
  }

  if (minutesSinceLastBreak < 60) {
    return '#ed6c02';
  }

  return '#d32f2f';
}

export default function App() {
  const [activities, setActivities] = useState<PerformedActivity[]>([]);
  const [workedHours, setWorkedHours] = useState(0);
  const [minutesSinceBreak, setMinutesSinceBreak] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editOpen, setEditOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<PerformedActivity | null>(null);
  const uploadStateInputRef = useRef<HTMLInputElement>(null);

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

  const handleUploadStateClicked = (ev: ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files;
    if (!files || files.length !== 1) {
      return;
    }

    files[0].text().then(content => {
      stateRecorder.importFromFile(content);
      setActivities(stateRecorder.getTimelineForToday());
    });
  }

  const handleDownloadStateClicked = () => {
    stateRecorder.exportToFile();
  }

  useEffect(() => {
    setActivities(stateRecorder.getTimelineForToday());

    const subscription = schedulerService.runOnceEvery(() => {
      setCurrentTime(new Date());
    }, 60 * 1000);

    return () => {
      subscription();
    };
  }, []);

  useEffect(() => {
    const workActivities = activities.filter(v => v.activity.id !== 1);
    const workTimeInMinutes = workActivities
      .map(v => v.endTime.diff(v.startTime, 'minutes'))
      .reduce((acc, v) => acc + v, 0);

    const roundedHours = Math.round((workTimeInMinutes / 60) * 100) / 100;

    setWorkedHours(roundedHours);
  }, [activities]);

  useEffect(() => {
    const lastBreak = activities.findLast(v => [1, 2].includes(v.activity.id));
    if (lastBreak) {
      const diff = createDate().diff(lastBreak.endTime, 'minutes');
      setMinutesSinceBreak(diff);
    }


    console.log('time since last break runs here!');
  }, [activities, currentTime])

  const availableActivities = stateRecorder.getAvailableActivities();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', justifyContent: 'end', marginRight: '20rem' }}>
        <Tooltip title="Upload State">
          <IconButton color='warning' onClick={() => uploadStateInputRef.current?.click()} >
            <CloudUploadIcon></CloudUploadIcon>
            <Box sx={{display: 'none'}}><input ref={uploadStateInputRef} type="file" accept='.json' multiple={false} onChange={handleUploadStateClicked} /></Box>
          </IconButton>
        </Tooltip>
        <Tooltip title="Download State">
          <IconButton color='primary' onClick={handleDownloadStateClicked} >
            <CloudDownloadIcon></CloudDownloadIcon>
          </IconButton>
        </Tooltip>
        <Link href="https://github.com/fredsson/tydlig-tid" target="_blank" ><IconButton><GitHubIcon/></IconButton></Link>
      </Box>
      <Typography sx={{textAlign: 'center'}} variant="h2">Tydlig Tid</Typography>
      <Box sx={{ my: 3, mx: 2}}>
        <AddActivityForm activities={availableActivities} onActivityAdded={handleActivityAdded} />
      </Box>
      <Divider variant="middle" />
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem'}}>
        <Typography sx={{minWidth: '30rem'}} variant="h4" >
          Today ({workedHours}h)
          <Button sx={{marginLeft: '2rem'}} variant="contained" onClick={handleNewDay}>New Day</Button>
        </Typography>
        <Typography variant='subtitle1' color={colorBasedOnTimeSinceBreak(minutesSinceBreak)} >Last break {minutesSinceBreak} minutes ago</Typography>
        <List sx={{minWidth: '30rem'}}>
          { activities.map((a, index) => (<div key={a.id}>
            {index === 0 ? <Divider /> : ''}
            <ListItem sx={{borderLeft: '1px solid rgba(0,0,0, 0.12)', borderRight: '1px solid rgba(0,0,0, 0.12)'}} key={a.id} dense={true}>
              <ListItemText primary={a.activity.name} secondary={`${a.startTime.format('HH:mm')}-${a.endTime.format('HH:mm')}`} />
              <ListItemIcon onClick={() => handleEditClicked(a)} sx={{justifyContent: 'end'}}><EditIcon /></ListItemIcon>
            </ListItem>
            <Divider />
          </div>)) }
        </List>
      </Box>
      {editActivity && <EditActivityDialog open={editOpen} activities={availableActivities} onClose={handleEditClosed} performedActivity={editActivity} ></EditActivityDialog>}
    </LocalizationProvider>
  )
}
