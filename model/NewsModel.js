'use strict';

const mongoose = require ("mongoose");
const Schema = mongoose.Schema;
const BasePlugins = require ("./plugins/BasePlugins");

/*
Type: String Number Date Buffer Boolean Mixed Objectid Array
*/

// create a schema
const schema = new Schema({
	_id: { type: Number, inc: true},
	name: String,
	parent_id: Number,
	parent_name: String,
	name_ko_dau: String,
	sort: Number,

	thumb: String,
	description: String,
	content: String,

	i_view: Number,
	i_like: Number,
	total_like: Number,
	tags: [String],

	create_by: Number,
	is_publish_date: {type: Boolean, default: false},
	publish_at: Date,
	publish_end: Date,

	status: {type: Number, default: 0},
	active: {type: Boolean, default: true},

	deleted: {type: Boolean, default: false},
	delete_by: Number,

	created_atx: String,
	updated_atx:String
});

const col_name = 'news';
schema.set('autoIndex', false);
schema.plugin(BasePlugins, {col_name: col_name});
module.exports = mongoose.model(col_name, schema);