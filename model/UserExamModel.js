'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/* Type: String Number Date Buffer Boolean Schema.Types.Mixed Objectid Array */
// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	user_id: { type: Number, required: true},
	exam_id: { type: Number, required: true},

	play_index: { type: Number, default: 1},//luot thi
	score: { type: Number, default: 0},
	content: Array,
	answers: Array,

	type_id: { type: Number, default: 1},
	play: Number,
	time: Number,
	round_id: Number,
	test: Number,
	class_id: Number,

	total_time: Number,
	wrong_count: Number,

	client_submit: Schema.Types.Mixed,

	end_at: { type: Date, default: Date.now },
	user_end_at: Date
});

const col_name = 'user_exams';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);