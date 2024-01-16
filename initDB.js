const VolunteeringDB = require('./volunteeringDB.js')

const Volunteer = VolunteeringDB.getModel().volunteerModel
const Day = VolunteeringDB.getModel().dayModel

async function init() {

	//asynchronous function that initializes database.  This deletes all data in collections.

	await Volunteer.deleteMany({})
	await Day.deleteMany({})

	let volunteer1 = new Volunteer({
		firstName:'John',lastName:'Smith', email: 'blah@blah.com', username: 'jsmith', skills: ['cooking', 'driving'], availability: ['mon', 'tue', 'wed', 'thu', 'fri'], days: [
			{day: '231010', activity: 'cook'},
			{day: '231017', activity: 'drive'},
			{day: '231018', activity: 'drive'},
			{day: '231019', activity: 'drive'},
			{day: '231020', activity: 'drive'},
			{day: '231024', activity: 'pack'}
		]
	})

	let volunteer2 = new Volunteer({
		firstName:'Adam',lastName:'Doe', email: 'merp@blah.com', username: 'adoe', skills: 'driving', availability: ['sat', 'sun'], days: [
			{day: '231010', activity: 'drive'},
			{day: '231012', activity: 'drive'},
			{day: '231001', activity: 'drive'}
		]
	})

	let volunteer3 = new Volunteer({
		firstName:'Jennifer',lastName:'Robinson', email: 'argh@blah.com', username: 'jrobinson', skills: 'packing', availability: ['tue'], days: [
			{day: '231005', activity: 'pack'},
			{day: '231009', activity: 'pack'},
			{day: '231010', activity: 'pack'},
			{day: '231015', activity: 'pack'},
			{day: '231018', activity: 'pack'},
			{day: '231019', activity: 'pack'},
			{day: '231020', activity: 'pack'}
		]
	})
	
	let day1 = new Day({
		day: '231001', volunteers: [], dayName: 'sun'
	})
	let day2 = new Day({
		day: '231002', volunteers: [], dayName: 'mon'
	})
	let day3 = new Day({
		day: '231003', volunteers: [], dayName: 'tue'
	})
	let day4 = new Day({
		day: '231004', volunteers: [], dayName: 'wed'
	})
	let day5 = new Day({
		day: '231005', volunteers: [], dayName: 'thu'
	})
	let day6 = new Day({
		day: '231006', volunteers: [], dayName: 'fri'
	})
	let day7 = new Day({
		day: '231007', volunteers: [], dayName: 'sat'
	})
	let day8 = new Day({
		day: '231008', volunteers: [], dayName: 'sun'
	})
	let day9 = new Day({
		day: '231009', volunteers: [], dayName: 'mon'
	})
	let day10 = new Day({
		day: '231010', volunteers: [], dayName: 'tue'
	})
	let day11 = new Day({
		day: '231011', volunteers: [], dayName: 'wed'
	})
	let day12 = new Day({
		day: '231012', volunteers: [], dayName: 'thu'
	})
	let day13 = new Day({
		day: '231013', volunteers: [], dayName: 'fri'
	})
	let day14 = new Day({
		day: '231014', volunteers: [], dayName: 'sat'
	})
	let day15 = new Day({
		day: '231015', volunteers: [], dayName: 'sun'
	})
	let day16 = new Day({
		day: '231016', volunteers: [], dayName: 'mon'
	})
	let day17 = new Day({
		day: '231017', volunteers: [], dayName: 'tue'
	})
	let day18 = new Day({
		day: '231018', volunteers: [], dayName: 'wed'
	})
	let day19 = new Day({
		day: '231019', volunteers: [], dayName: 'thu'
	})
	let day20 = new Day({
		day: '231020', volunteers: [], dayName: 'fri'
	})
	let day21 = new Day({
		day: '231021', volunteers: [], dayName: 'sat'
	})
	let day22 = new Day({
		day: '231022', volunteers: [], dayName: 'sun'
	})
	let day23 = new Day({
		day: '231023', volunteers: [], dayName: 'mon'
	})
	let day24 = new Day({
		day: '231024', volunteers: [], dayName: 'tue'
	})
	let day25 = new Day({
		day: '231025', volunteers: [], dayName: 'wed'
	})
	let day26 = new Day({
		day: '231026', volunteers: [], dayName: 'thu'
	})
	let day27 = new Day({
		day: '231027', volunteers: [], dayName: 'fri'
	})
	let day28 = new Day({
		day: '231028', volunteers: [], dayName: 'sat'
	})
	let day29 = new Day({
		day: '231029', volunteers: [], dayName: 'sun'
	})
	let day30 = new Day({
		day: '231030', volunteers: [], dayName: 'mon'
	})
	let day31 = new Day({
		day: '231031', volunteers: [], dayName: 'tue'
	})

	await Promise.all([
			volunteer1.save(), 
			volunteer2.save(), 
			volunteer3.save(),
			day1.save(),
			day2.save(),
			day3.save(),
			day4.save(),
			day5.save(),
			day6.save(),
			day7.save(),
			day8.save(),
			day9.save(),
			day10.save(),
			day11.save(),
			day12.save(),
			day13.save(),
			day14.save(),
			day15.save(),
			day16.save(),
			day17.save(),
			day18.save(),
			day19.save(),
			day20.save(),
			day21.save(),
			day22.save(),
			day23.save(),
			day24.save(),
			day25.save(),
			day26.save(),
			day27.save(),
			day28.save(),
			day29.save(),
			day30.save(),
			day31.save()
		]);

	let currentVolunteers = await Volunteer.find({});
	
	//Map volunteers to days--this lets user see who is volunteering for any given day
	for (v of currentVolunteers) {
		for (d of v.days) {
			let currentDay = await Day.findOne({day: d.day})
            currentDay.volunteers.push({id: v._id, activity: d.activity})
            await currentDay.save()
        }
    }
	
	let currentDays = await Day.find({})

	console.log(currentVolunteers);
	console.log(currentDays)

	process.exit();

}

init()