# Caas
Campus Automation and Attendance System

The index.js file has the code to functions like addStamp and schedule

addStamp:
This function when invoked using GET request with query "rfid=" adds current timestamp(IST) to the firebase database with index.
If the query is not present in database it creates a child and stores the timestamp.
count is a variable that also gets created along with the new child that keeps track of number of time stamps.

schedule:
This functions schedules a cron-like jobs. It executes the contents every hour at 30 minutes from 9:30 to 17:30 on weekdays mon-fri.

This uses cloud functions of firebase to
-Write data to firebase
-Read data from firebase
-Schedule jobs


