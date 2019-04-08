'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	name: { type: String, required: true },
	name_ko_dau: { type: String, required: true },
	active: Boolean,
	time_begin: Number,
	time_end: Number,
	type: Number
});

const col_name = 'exam_event_types';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);