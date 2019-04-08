'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/* Type: String Number Date Buffer Boolean Mixed Objectid Array */
// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	category_id: Number,
	category_name: String,
	type_id: String,
	name: String,
	name_ko_dau: String,
	url: String,
	thumb: String,
	description: String,
	content: String,
	sort: Number,
	active: Boolean,
	create_by: Number,
	is_publish_date: Boolean,
	publish_at: Date,
	publish_end: Date,
	tags: [String],
});

const col_name = 'games';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);