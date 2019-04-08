'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/* Type: String Number Date Buffer Boolean Mixed Objectid Array */
// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	user_exam_id: { type: Number, required: true},
	answer: Schema.Types.Mixed,
});

const col_name = 'user_exam_details';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);