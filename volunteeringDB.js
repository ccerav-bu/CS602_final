const mongoose = require('mongoose');

const credentials = require("./credentials.js");

const dbUrl = 'mongodb://' + credentials.host + '/' + credentials.database;

let connection = null
let volunteerModel = null
let dayModel = null
let models = null

let Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

let volunteerSchema = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	username: String,
	skills: Array,
	availability: Array,
	days: Array,
}, {
	collection: 'volunteers'
})
let daySchema = new Schema({
	day: String,
	volunteers: Array,
	dayName: String
}, {
	collection: 'days'
})

module.exports = {
	getModel: () => {
		if (connection == null) {
			connection = mongoose.createConnection(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
			volunteerModel = connection.model("Volunteer", volunteerSchema);
			dayModel = connection.model('Day', daySchema)
			models = {volunteerModel: volunteerModel, dayModel: dayModel}
		}
		return models
	}
}