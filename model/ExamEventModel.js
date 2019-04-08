'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	type_id: Number,
	class_id: Number,
	game_id: Number,
	spq: {type: Number, default: 10},
	play: Number,
	time: Number,

	answers: [Schema.Types.Mixed],
	content: [Schema.Types.Mixed],
});

const col_name = 'exam_events';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);