'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/* Type: String Number Date Buffer Boolean Mixed Objectid Array */
// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	name: { type: String, required: true},

	type_id: Number,
	type_name: String,

	title: String,
	desctiption: String,
	play: { type: Number, default: 10},
	time: { type: Number, default: 1200},
	class_id: Number,
	class_name: String,
	round_id: Number,
	round_name: String,
	subject_id: Number,
	subject_name: String,
	test: Number,
	game_id: Number,
	game_name: String,
	answers: Schema.Types.Mixed,
	content: [Schema.Types.Mixed],
});

const col_name = 'exams';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);