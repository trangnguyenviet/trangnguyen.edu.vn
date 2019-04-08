'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

// create a schema
const schema = new Schema({
	// _id: { type: Number, inc: true},
	// _id: Schema.Types.ObjectId,
	user_id: Number,
	// fullname: String,
	event_id: Number,
	// class_id: Number,
	score: Number,
	time: Number,
	// exam_no: {type:Number, default:1},
});

const col_name = 'user_score_events';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);