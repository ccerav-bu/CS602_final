Chris Ceravolo
Term Project
August 19th, 2023


------------------------------------

PROJECT DESCRIPTION

------------------------------------

This project provides an interface for volunteers looking to sign up at a local food pantry/kitchen.  

The application focuses on the volunteer experience.  You can create a profile using an email (no password needed).  You fill out some basic information--such as first name, last name, email, etc.  Then you go to your personalized dashboard.

In your personalized dashboard, you can edit your profile information, and edit your volunteering schedule.  A calendar view shows what is available when.

The calendar is specially coded to convey some key information that makes it easy for everybody to sign up.  The calendar shows vacant slots for a variety of tasks (cooking, driving, and packing).  It also shows suggested tasks for you--depending on your skills and typical availability provided in your profile.  The calendar also shows which days you have already signed up for.

When you sign up for a day/task on the calendar, this will disappear from the calendars in other users' profiles, because everything is connected to a database.

Note that this project only uses a calendar with the month of October 2023, to keep things simple.  Version 2 of this project would implement a real calendar that extends into the past and future.


------------------------------------

SETTING UP THE PROJECT

------------------------------------

STEP 1
Run npm install --save to ensure that you have the proper modules in accordance with the JSON package files.  Note that I am using the latest version of MongoDB community edition.

STEP 2
Run the initDB.js file.  This will use the credentials.js file to create a database called "ceravolo_term_project" on localhost (port 27017).

STEP 3
Run the server.js file.  This gets things running on your localhost (port 3000).  You should see "localhost:3000 . . ." print on the terminal to indicate that things are running properly. Open a web browser and navigate to localhost:3000/

STEP 4
Create a profile, and log in with your desired username.  You are now ready to start volunteering.


------------------------------------

API DOCUMENTATION

------------------------------------

At any time, you can enter "localhost:3000/api" into the search bar along with some queries to get some information from the database.

Data can be returned in either JSON (application/json) or XML (application/xml) formats.  

Here are some example entries:

//Get all volunteers
localhost:3000/api?action=volunteers&find=all

//Get an individual volunteer (must provide first and last name)
localhost:3000/api?action=volunteers&find=individual&firstname=John&lastname=Smith

//Get the data for every day
localhost:3000/api?action=schedule&find=all

//Get the data for a given day, must enter six-digit code YYMMDD
localhost:3000/api?action=schedule&find=day&day=231017

//Find out who is available to help on a given day, must enter six-digit code YYMMDD
localhost:3000/api?action=volunteer-match&day=231018

//Specify a repsonse in JSON format
localhost:3000/api?format=application/json&action=volunteer-match&day=231018

//Specify a response in XML format
localhost:3000/api?format=application/xml&action=volunteers&find=all

//Return a 404 response because the search returns no results (notice the placement of XXX in the query value)
localhost:3000/api?format=application/json&action=volunteer-match&day=231018XXX

//Return a 404 response because of an invalid query (notice the placement of XXX in the query key)
localhost:3000/api?XXXformat=application/json&action=volunteer-match&day=231018