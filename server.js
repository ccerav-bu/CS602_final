//import modules
const express = require("express");
const cookieParser = require('cookie-parser')
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
var handlebars = require('express-handlebars');
const VolunteeringDB = require('./volunteeringDB.js')

//definitions
const app = express();
const Volunteer = VolunteeringDB.getModel().volunteerModel
const Day = VolunteeringDB.getModel().dayModel

// setup handlebars view engine
app.engine('handlebars', handlebars({defaultLayout: 'main_logo'}));
app.set('view engine', 'handlebars');

// static resources
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    session({
        secret: "Keep it secret",
        name: "uniqueSessionID",
        resave: false,
        saveUninitialized: false,
    })
)


/***************************************************************************
********************************** ROUTING *********************************
*******(version 2 of this application would implement express router)*******
****************************************************************************/


app.get("/", (req, res) => {
    if (req.session.loggedIn) res.redirect("/volunteer-dashboard")
    else res.render("homeView")
})

app.get("/login", (req, res) => {
    res.render("loginView")
})

app.get("/create-profile", (req, res) => {
    res.render('createProfileView')
})

app.post('/create-profile/submit', 
    async (req, res, next) => {
        //logic for creating the user profile

        let currentVolunteers = await Volunteer.find({})
        let errMessage = ''

        //ensure that username does not already exist
        if (currentVolunteers.find(el => el.username == req.body.username)) {
            errMessage = `The username "${req.body.username}" exists.  Please choose a different username.`
            res.render('createProfileView', {errMessage: errMessage})
        } else {
            let profile = new Volunteer({
                firstName: req.body.firstname, lastName: req.body.lastname, email: req.body.email, username: req.body.username, skills: req.body.skills, availability: req.body.availability, days: []
            })
            await profile.save()
            next()
        }
    }, async (req, res, next) => {
        //authenticate user
        let user = await Volunteer.findOne({username: req.body.username})
        if (req.body.username == user.username) {
            res.locals.username = req.body.username;
            next();
        } else res.sendStatus(401);
    },
    async (req, res) => {
        //log in user
        req.session.loggedIn = true;
        req.session.username = res.locals.username;
        res.redirect("/volunteer-dashboard");
    }
)

app.get("/volunteer-dashboard", async (req, res) => {
    if (req.session.loggedIn) {
        //if session is logged in, get the user.  Otherwise go to login.

        //get data
        let user = await Volunteer.findOne({username: req.session.username})
        let days = await Day.find({})
    
        //create a deep copy of user object so that properties can be accessed in handlebars
        let userCopy = JSON.parse(JSON.stringify(user))
        let daysCopy = JSON.stringify(days)

        //render data
        res.render("volunteerDashboardView", {user: userCopy, days: daysCopy})

    } else res.redirect("/login");
});

app.post("/volunteer-dashboard/schedule-change", async (req, res) => {
    //This is triggered when volunteer submits form to add days to schedule

    if (req.session.loggedIn) {
        //if session is logged in, get the user.  Otherwise go to login.

        // get data
        let user = await Volunteer.findOne({username: req.session.username})
        let days = await Day.find({})
        let rawData = req.body.volunteerdays

        async function processData(data) {

            // add to the user's schedule  
            let scheduledDay = JSON.parse(data)
            user.days.push(scheduledDay)
            await user.save()

            //add to the daily data, so others can know what is available when
            let dayData = days.find((el) => el.day == scheduledDay.day)
            dayData.volunteers.push({id: user._id, activity: scheduledDay.activity})
            await dayData.save()
        }
        
        //handle scheduling one task versus multiple tasks
        if (typeof rawData == 'object') {
            //if the rawData is an object, that means it's an array with multiple tasks.  need to iterate over this.
            //schedule multiple tasks
            for (row of rawData) {
                await processData(row)
            }
        } else if (typeof rawData == 'string') {
            //if the rawData is a string, that means it's just one task
            //schedule one task
            await processData(rawData)
        }

        res.redirect('/volunteer-dashboard')

    } else res.redirect("/login");
});

app.get("/volunteer-dashboard/edit", async (req, res) => {
    if (req.session.loggedIn) {
        //if session is logged in, get the user.  Otherwise go to login.

        //get data
        let user = await Volunteer.findOne({username: req.session.username})
    
        //create a deep copy of user object so that properties can be accessed in handlebars
        let userCopy = JSON.parse(JSON.stringify(user))
        let userCopyString = JSON.stringify(user)

        //render data
        res.render("editVolunteerDashboardView", {user: userCopy, userString: userCopyString})

    } else res.redirect("/login");
});

app.post("/volunteer-dashboard/edit", async (req, res) => {
    
    if (req.session.loggedIn) {
        //if session is logged in, get the user.  Otherwise go to login.

        //get data
        let user = await Volunteer.findOne({username: req.session.username})
        let rawData = req.body.volunteerdays

        /******** UPDATE SCHEDULING DATA FIRST, IN "VOLUNTEER" AND "DAY" COLLECTIONS ********/

        //take note of the user's original schedule, as an array of strings.  will use this later
        let originalListStrings = [] 
        for (object of user.days) {
            originalListStrings.push(JSON.stringify(object))
        }

        //the new schedule will be stored in this variable
        let newList = []
        
        //update user data
        //handle scheduling one task versus multiple tasks
        if (typeof rawData == 'object') {
            //if the rawData is an object, that means it's an array with multiple tasks.  need to iterate over this.
            //schedule multiple tasks
            for (row of rawData) {
                newList.push(JSON.parse(row))
                user.days = newList
            }
        } else if (typeof rawData == 'string') {
            //if the rawData is a string, that means it's just one task
            //schedule one task
            newList.push(JSON.parse(rawData))
            user.days = newList
        }

        //stringify new list so that it can be compared against the original list
        let newListStrings = []
        for (object of newList) {
            newListStrings.push(JSON.stringify(object))
        }

        //compare new against original.  what to delete from Day data?
        for (originalString of originalListStrings) {
            if (newListStrings.includes(originalString)) {
                continue
            } else {
                //the original object is not in the new list, so find the corresponding Day data for editing
                originalObject = JSON.parse(originalString)
                let dayToEdit = await Day.find({day: originalObject.day})
                dayToEdit = dayToEdit[0]
                for (task in dayToEdit.volunteers) {
                    //ids are returning as objects--need to turn them into strings for comparison
                    let dayToEditVolunteerId = JSON.stringify(dayToEdit.volunteers[task].id)
                    let userId = JSON.stringify(user.id)
                    
                    //if the ids and the activities match, delete the data
                    if ((dayToEditVolunteerId == userId) && (dayToEdit.volunteers[task].activity == originalObject.activity)) {
                        dayToEdit.volunteers.splice(task, 1)
                        await dayToEdit.save()
                    }
                }
            }
        }
        
        /************ UPDATE OTHER USER DATA, IN "VOLUNTEER" COLLECTION ************/
    
        if (req.body.firstname) {
            user.firstName = req.body.firstname
        }
        if (req.body.lastname) {
            user.lastName = req.body.lastname
        }
        if (req.body.username) {
            user.username = req.body.username
            res.locals.username = req.body.username
            req.session.username = req.body.username
        }
        if (req.body.email) {
            user.email = req.body.email
        }
        user.skills = req.body.skills
        user.availability = req.body.availability


        await user.save()
        res.redirect('/volunteer-dashboard')

    } else res.redirect("/login")
})

app.post("/authenticate",
    async (req, res, next) => {
        //authenticate user
        let user = await Volunteer.findOne({username: req.body.username})
        if (req.body.username == user.username) {
            res.locals.username = req.body.username;
            next();
        } else res.sendStatus(401);
    },
    async (req, res) => {
        //log in user
        req.session.loggedIn = true;
        req.session.username = res.locals.username;
        // console.log(req.session);
        res.redirect("/volunteer-dashboard");
    }
);

app.get("/logout", (req, res) => {
    req.session.destroy((err) => { });
    res.redirect('/login');
});

app.get("/api", async (req, res) => {

    //establish the response variable, the script will fill it with data and then send it
    let response

    //?action=volunteers&find=all
    if ((req.query.action == 'volunteers') && (req.query.find == 'all')) {
        response = await Volunteer.find({})

    } else if ((req.query.action == 'volunteers') && (req.query.find == 'individual')) {
        //need first name and last name to search for an individual
        let firstname = req.query.firstname
        let lastname = req.query.lastname
        let searchObject = {firstName: firstname, lastName: lastname}
        response = await Volunteer.find(searchObject)

    } else if ((req.query.action == 'schedule') && (req.query.find == 'all')) {
        response = await Day.find({})

    } else if ((req.query.action == 'schedule') && (req.query.find == 'day')) {
        //need six-digit day code YYMMDD to search Day collection
        response = await Day.find({day: req.query.day})

    } else if (req.query.action == 'volunteer-match') {
        //need six-digit day code YYMMDD to search Day collection
        let allVolunteers = await Volunteer.find({})
        let day = await Day.find({day: req.query.day})

        //need to drop the array surrounding the day object
        day = day[0]

        try {
            let needs = ['cook', 'drive', 'pack']
            //remove items from the needs list if they are scheduled for the given day
            for (v of day.volunteers) {
                if (needs.includes(v.activity)) {
                    let index = needs.indexOf(v.activity)
                    needs.splice(index, 1)
                }
            }

            //slight inefficiency--I have volunteer.skills terminology as "cooking" and day.volunteers.activity terminology as "cook"
            //need to account for this so that I can map things properly.  This is something to fix on a second version of this app.
            let needsRephrased = []
            for (need of needs) {
                if (need == 'cook') {
                    needsRephrased.push('cooking')
                }
                if (need == 'drive') {
                    needsRephrased.push('driving')
                }
                if (need == 'pack') {
                    needsRephrased.push('packing')
                }
            }

            //check for volunteers who have skills and availability that match the needs of the day
            let availableVolunteers = []
            for (v of allVolunteers) {
                let skillMatch
                for (need of needsRephrased) {
                    if (v.skills.includes(need)) {
                        skillMatch = true
                        break
                    }
                }
                if ((v.availability.includes(day.dayName)) && (skillMatch)) {
                    availableVolunteers.push(v)
                }
            }

            response = availableVolunteers

        } catch {
            //set response equal to empty array so that 404 gets returned
            response = []
        }
        
    } else {
        //set response equal to empty array so that 404 gets returned
        response = []
    }
    

	// By default, res.format() returns the first data-type available in the "Accept" header. In the event that a user requests a specific data format, we change the "Accept" header in the request object, and the res.format() will return the desired format.
    let customFormat = req.query.format
	if(customFormat){
		req.headers.accept = customFormat
	}
	
	// If response is empty array, then make sure res.format() reutrns a 404 error 
	if(response.length < 1){
		req.headers.accept = 'default'
	}
	
	res.format({

		'application/json': () => {
			res.json(response)
		},

		'application/xml': () => {

            // dynamically turn JSON responses into XML
            let xmlResponse = '<?xml version="1.0"?>'
            for (object of JSON.parse(JSON.stringify(response))) {
                xmlResponse += `<object>`
                let keys = Object.keys(object)
                let values = Object.values(object)
                for (a in keys) {
                    xmlResponse += `<${keys[a]}>`
                    if (typeof values[a] == 'object') {
                        for (b in values[a]) {
                            if (typeof values[a][b] == 'object') {
                                xmlResponse += `<item>`
                                let innerKeys = Object.keys(values[a][b])
                                let innerValues = Object.values(values[a][b])
                                for (c in innerKeys) {
                                    xmlResponse += `<${innerKeys[c]}>${innerValues[c]}</${innerKeys[c]}>`
                                }
                                xmlResponse += `</item>`
                            } else {
                                xmlResponse += `<item>${values[a][b]}</item>`
                            }
                        }
                    } else {
                        xmlResponse += `${values[a]}`
                    }
                    xmlResponse += `</${keys[a]}>`
                }
                xmlResponse += `</object>`
            }
            
            res.type('application/xml')
			res.send(xmlResponse)
		},

		'default': () => {
			res.status(404);
			res.render("404");
		}
	})
})

app.use(function(req, res) {
	res.status(404)
	res.render('404')
})

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
    }
    console.log("localhost:3000 . . .");
});
