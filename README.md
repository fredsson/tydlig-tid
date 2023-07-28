# Tydlig Tid

This is a small app where you can keep track of the day to day activities.

## Getting Started

Before you can add activities you need to add some custom ones (since the app only has Lunch and Break by default).
Easiest way to do this is to first click the export state button at the top of the page, this will download a json file with the following format:
```json
{
  "activities": [
    {
      "color": "red",
      "name": "Lunch",
      "id": 1
    },
    {
      "color": "orange",
      "name": "Break",
      "id": 2
    }
  ],
  "timelines": {
  }
}
```
Add the activities you need into the activities prop. Once all need activities have been added save the file and click the upload state button in the app and select the updated file, all activities added should now be available in the activity dropdown.

NOTE: State is kept in the storage of your browser, if you want to use the same state on multiple computers you need to sync it yourself with something like OneDrive.
